// Deals data layer.
//
// Ported from New-ASR-Client/backend/src/routes/deals.ts (Hono + Postgres).
// The REST contract and the status/sorting rules are kept identical so the
// admin dashboard behaves the same; storage is a local JSON file so next-web
// runs standalone. Swap `readAll`/`writeAll` for a pg Pool to move to Postgres.

import { promises as fs } from "fs";
import path from "path";

export interface Deal {
  id: number;
  _id: number; // alias of `id` — the admin UI reads `_id`
  from: string;
  to: string;
  plane: string;
  date: string;
  time: string;
  seater: number;
  perSeat: number;
  wholeJet: number;
  booked: boolean;
  image?: string | null;
  isDeleted?: boolean;
  dealDateTime?: string;
  /** True once the departure instant has passed. Such deals are not listed. */
  departed?: boolean;
}

/** A deal as it sits on disk — no derived fields. */
type StoredDeal = Omit<Deal, "_id" | "dealDateTime" | "departed">;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "deals.json");

async function readAll(): Promise<StoredDeal[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

/**
 * Remove temp files left behind by writes that were interrupted before the
 * rename. Without this they accumulate — an aborted 5 MB request once left a
 * 5 MB orphan sitting in data/.
 */
async function sweepTempFiles(): Promise<void> {
  try {
    const entries = await fs.readdir(DATA_DIR);
    const cutoff = Date.now() - 3600_000;

    await Promise.all(
      entries
        .filter((name) => name.startsWith("deals.json.") && name.endsWith(".tmp"))
        .map(async (name) => {
          const full = path.join(DATA_DIR, name);
          try {
            const stat = await fs.stat(full);
            if (stat.mtimeMs < cutoff) await fs.rm(full, { force: true });
          } catch {
            /* already gone */
          }
        })
    );
  } catch {
    /* sweeping is best-effort */
  }
}

async function writeAll(deals: StoredDeal[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write-then-rename so a crash mid-write can't truncate the store.
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(deals, null, 2), "utf8");
    await fs.rename(tmp, DATA_FILE);
  } catch (err) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
  void sweepTempFiles();
}

// Serialize read-modify-write cycles; concurrent admin requests would
// otherwise clobber each other on a plain file.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

/**
 * Local time zone the stated departure times belong to, in minutes east of
 * UTC. 330 = IST (UTC+5:30), which has no DST.
 */
const DEAL_TZ_OFFSET_MINUTES = Number(process.env.DEAL_TZ_OFFSET_MINUTES ?? 330);

/**
 * Hours after departure before a deal is permanently removed. The grace window
 * absorbs clock skew and late edits; deals stop being *shown* the moment they
 * depart, regardless of this.
 */
const PURGE_GRACE_HOURS = Number(process.env.DEAL_PURGE_GRACE_HOURS ?? 24);

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Resolve a deal's departure to an absolute instant (epoch ms).
 *
 * The stored date/time are wall-clock values in DEAL_TZ_OFFSET_MINUTES, so the
 * conversion is done explicitly rather than via `new Date(...)`, whose result
 * depends on the server's own time zone. The previous implementation relied on
 * the server running in UTC and was 5.5h off anywhere else — harmless while
 * expired deals were merely hidden, but not once they are deleted.
 *
 * Returns null when the date cannot be understood. Callers must treat null as
 * "never expire": we do not delete what we cannot evaluate.
 */
function resolveDeparture(deal: StoredDeal): number | null {
  const raw = (deal.date || "").trim();
  if (!raw) return null;

  let year: number, month: number, day: number;

  // "August 15, 2026" / "15 August 2026"
  const named = raw.match(/^(?:([A-Za-z]+)\s+(\d{1,2})|(\d{1,2})\s+([A-Za-z]+))[,\s]+(\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (named) {
    const monthName = (named[1] || named[4]).toLowerCase();
    const index = MONTHS.findIndex((m) => m.startsWith(monthName.slice(0, 3)));
    if (index === -1) return null;
    month = index;
    day = Number(named[2] || named[3]);
    year = Number(named[5]);
  } else if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]) - 1;
    day = Number(iso[3]);
  } else {
    return null;
  }

  if (!Number.isFinite(year) || !Number.isFinite(day) || day < 1 || day > 31) return null;

  // Default to end of day when no time is given, so a dateless deal survives
  // its whole date rather than expiring at midnight.
  let hours = 23;
  let minutes = 59;

  const timeMatch = (deal.time || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (timeMatch) {
    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2]);
    const period = timeMatch[3]?.toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  }

  if (hours > 23 || minutes > 59) return null;

  return Date.UTC(year, month, day, hours, minutes) - DEAL_TZ_OFFSET_MINUTES * 60_000;
}

/**
 * Apply derived fields, drop deals whose departure has passed, and sort by
 * departure. A deal reads as booked within an hour of departure, and vanishes
 * from the listing the moment its date/time is gone.
 */
function decorate(deals: StoredDeal[]): Deal[] {
  const now = Date.now();

  return deals
    .map((deal) => {
      const departure = resolveDeparture(deal);
      const delta = departure === null ? Infinity : departure - now;

      return {
        ...deal,
        _id: deal.id,
        // An explicit `booked` flag set by an admin always wins.
        booked: deal.booked || delta < 3600000,
        departed: delta <= 0,
        dealDateTime: departure === null ? undefined : new Date(departure).toISOString(),
      } as Deal;
    })
    .filter((deal) => !deal.isDeleted && !deal.departed)
    .sort((a, b) => {
      const at = a.dealDateTime ? Date.parse(a.dealDateTime) : Infinity;
      const bt = b.dealDateTime ? Date.parse(b.dealDateTime) : Infinity;
      return at - bt;
    });
}

/** Deals removed by the purge are appended here so the delete is recoverable. */
const ARCHIVE_FILE = path.join(DATA_DIR, "deals-archive.json");

async function archive(deals: StoredDeal[]): Promise<void> {
  if (!deals.length) return;

  let existing: unknown[] = [];
  try {
    const raw = await fs.readFile(ARCHIVE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) existing = parsed;
  } catch (err: any) {
    if (err?.code !== "ENOENT") throw err;
  }

  const stamped = deals.map((deal) => ({ ...deal, purgedAt: new Date().toISOString() }));
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${ARCHIVE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify([...existing, ...stamped], null, 2), "utf8");
  await fs.rename(tmp, ARCHIVE_FILE);
}

/**
 * Permanently remove deals whose departure passed more than PURGE_GRACE_HOURS
 * ago. Deals with an unparseable date are never touched — silently deleting
 * something we cannot evaluate would be worse than leaving it listed.
 *
 * Returns the number removed.
 */
export async function purgeExpiredDeals(): Promise<number> {
  return withLock(async () => {
    const deals = await readAll();
    const cutoff = Date.now() - PURGE_GRACE_HOURS * 3600_000;

    const expired: StoredDeal[] = [];
    const keep: StoredDeal[] = [];

    for (const deal of deals) {
      const departure = resolveDeparture(deal);
      if (departure !== null && departure < cutoff) expired.push(deal);
      else keep.push(deal);
    }

    if (!expired.length) return 0;

    // Archive first: if this throws, nothing is deleted.
    await archive(expired);
    await writeAll(keep);

    console.info(
      `[deals] purged ${expired.length} expired deal(s): ${expired
        .map((d) => `#${d.id} ${d.from}->${d.to} ${d.date}`)
        .join(", ")}`
    );
    return expired.length;
  });
}

/**
 * GET — upcoming deals, sorted by departure.
 *
 * Expired deals are purged opportunistically here. There is no scheduler in
 * this app, so the read path is what keeps the store from growing forever;
 * the work is trivial when nothing has expired.
 */
export async function listDeals(): Promise<Deal[]> {
  try {
    await purgeExpiredDeals();
  } catch (err) {
    // Never let housekeeping break the listing.
    console.error("[deals] purge failed:", err);
  }
  return decorate(await readAll());
}

/** PUT — add a deal. New deals always start un-booked, as in the original. */
export async function addDeal(input: Partial<Deal>): Promise<Deal> {
  return withLock(async () => {
    const deals = await readAll();
    const nextId = deals.reduce((max, d) => Math.max(max, d.id ?? 0), 0) + 1;

    const deal: StoredDeal = {
      id: nextId,
      from: String(input.from ?? "").trim(),
      to: String(input.to ?? "").trim(),
      plane: String(input.plane ?? ""),
      date: String(input.date ?? ""),
      time: String(input.time ?? ""),
      seater: Number(input.seater) || 0,
      perSeat: Number(input.perSeat) || 0,
      wholeJet: Number(input.wholeJet) || 0,
      booked: false,
      image: input.image ?? null,
      isDeleted: false,
    };

    await writeAll([...deals, deal]);
    return { ...deal, _id: deal.id } as Deal;
  });
}

const UPDATABLE = [
  "from",
  "to",
  "plane",
  "date",
  "time",
  "seater",
  "perSeat",
  "wholeJet",
  "booked",
  "image",
  "isDeleted",
] as const;

/** POST — patch an existing deal. Returns null when the id is unknown. */
export async function updateDeal(
  id: number,
  fields: Partial<Deal>
): Promise<Deal | null> {
  return withLock(async () => {
    const deals = await readAll();
    const index = deals.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const patch: Partial<StoredDeal> = {};
    for (const key of UPDATABLE) {
      if (!(key in fields)) continue;
      const value = (fields as any)[key];

      if (key === "seater" || key === "perSeat" || key === "wholeJet") {
        (patch as any)[key] = Number(value) || 0;
      } else if (key === "booked" || key === "isDeleted") {
        (patch as any)[key] = Boolean(value);
      } else {
        (patch as any)[key] = value;
      }
    }

    const updated = { ...deals[index], ...patch, id };
    deals[index] = updated;
    await writeAll(deals);
    return { ...updated, _id: updated.id } as Deal;
  });
}

/** DELETE — remove a deal. Returns false when the id is unknown. */
export async function deleteDeal(id: number): Promise<boolean> {
  return withLock(async () => {
    const deals = await readAll();
    const remaining = deals.filter((d) => d.id !== id);
    if (remaining.length === deals.length) return false;

    await writeAll(remaining);
    return true;
  });
}
