// Lead capture store.
//
// Enquiries from the service pages land here. Same JSON-file approach as
// lib/deals.ts — atomic writes, serialized read-modify-write — so it runs
// standalone. Swap readAll/writeAll for a database when you outgrow it.

import { promises as fs } from "fs";
import path from "path";
import type { Lead, LeadSource, LeadKind, LeadStatus } from "@/lib/leads-types";

// Re-exported so server code can keep importing everything from one place.
export * from "@/lib/leads-types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");

async function readAll(): Promise<Lead[]> {
  let raw: string;

  try {
    raw = await fs.readFile(DATA_FILE, "utf8");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // A truncated or hand-edited file must not take the endpoint down with a
    // 500. Quarantine it and carry on from empty; nothing is overwritten until
    // the next write, so the bad copy is preserved for inspection.
    const quarantine = `${DATA_FILE}.corrupt.${Date.now()}`;
    await fs.rename(DATA_FILE, quarantine).catch(() => {});
    console.error(
      `[leads] leads.json was not valid JSON — moved to ${path.basename(quarantine)}`,
      err
    );
    return [];
  }
}

async function writeAll(leads: Lead[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(leads, null, 2), "utf8");
    await fs.rename(tmp, DATA_FILE);
  } catch (err) {
    // Don't leave a partial file behind if the write or rename fails.
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
}

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

/** Newest first. */
export async function listLeads(): Promise<Lead[]> {
  const leads = await readAll();
  return leads.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function addLead(
  input: Omit<Lead, "id" | "status" | "createdAt" | "kind" | "source"> & {
    kind?: LeadKind;
    source?: LeadSource;
  }
): Promise<Lead> {
  return withLock(async () => {
    const leads = await readAll();
    const lead: Lead = {
      kind: "enquiry",
      source: "unknown",
      ...input,
      id: leads.reduce((max, l) => Math.max(max, l.id ?? 0), 0) + 1,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    await writeAll([...leads, lead]);
    return lead;
  });
}

/**
 * Bookings raised by one signed-in customer, newest first.
 * The email comes from a verified Google session, never from user input.
 */
export async function listLeadsForCustomer(email: string): Promise<Lead[]> {
  const target = email.toLowerCase();
  const leads = await readAll();

  return leads
    .filter((l) => (l.customerEmail || l.email || "").toLowerCase() === target)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus
): Promise<Lead | null> {
  return withLock(async () => {
    const leads = await readAll();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    leads[index] = { ...leads[index], status };
    await writeAll(leads);
    return leads[index];
  });
}

export async function deleteLead(id: number): Promise<boolean> {
  return withLock(async () => {
    const leads = await readAll();
    const remaining = leads.filter((l) => l.id !== id);
    if (remaining.length === leads.length) return false;
    await writeAll(remaining);
    return true;
  });
}
