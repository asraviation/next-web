// Request-body limits and deal field validation.
//
// Without these an unauthenticated-but-allowlisted caller could push an
// arbitrarily large base64 image into the store; every subsequent read then
// parses that blob, so one write degrades the whole endpoint.

export const MAX_BODY_BYTES = 2 * 1024 * 1024;  // 2 MB whole request
export const MAX_IMAGE_CHARS = 1_500_000;       // ~1.1 MB decoded
export const MAX_TEXT_CHARS = 200;

/** Images may be an inline base64 raster, or a same-origin / https URL. */
const DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export class ValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Read the body with a hard ceiling. Content-Length is a hint only — a
 * chunked request can lie — so the stream is measured as it arrives.
 */
export async function readJsonBody(request: Request): Promise<any> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    throw new ValidationError("Request body too large", 413);
  }

  const reader = request.body?.getReader();
  if (!reader) throw new ValidationError("Empty request body");

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      throw new ValidationError("Request body too large", 413);
    }
    chunks.push(value);
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  try {
    return JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    throw new ValidationError("Malformed JSON body");
  }
}

function text(value: unknown, field: string, required: boolean): string {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) {
    if (required) throw new ValidationError(`${field} is required`);
    return "";
  }
  if (str.length > MAX_TEXT_CHARS) {
    throw new ValidationError(`${field} exceeds ${MAX_TEXT_CHARS} characters`);
  }
  return str;
}

function num(value: unknown, field: string, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new ValidationError(`${field} must be a number`);
  if (n < 0) throw new ValidationError(`${field} cannot be negative`);
  if (n > max) throw new ValidationError(`${field} exceeds the maximum of ${max}`);
  return n;
}

/**
 * Reject anything that is not an inline raster or a plain http(s)/relative
 * URL — notably `javascript:`, `data:text/html`, and SVG (which can carry
 * script when opened directly).
 */
function image(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new ValidationError("image must be a string");

  if (value.length > MAX_IMAGE_CHARS) {
    throw new ValidationError("Image is too large (max ~1 MB)");
  }

  if (value.startsWith("data:")) {
    if (!DATA_URL.test(value)) {
      throw new ValidationError(
        "Image must be a base64 PNG, JPEG, WEBP or GIF data URL"
      );
    }
    return value;
  }

  if (value.startsWith("/")) return value; // same-origin path

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ValidationError("Image must be a valid URL");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ValidationError("Image URL must use http(s)");
  }

  return parsed.toString();
}

/** Validate a full deal (PUT). */
export function validateNewDeal(body: any) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Invalid request body");
  }

  return {
    from: text(body.from, "Origin", true),
    to: text(body.to, "Destination", true),
    plane: text(body.plane, "Aircraft type", false),
    date: text(body.date, "Date", false),
    time: text(body.time, "Time", false),
    seater: num(body.seater, "Seats", 1000),
    perSeat: num(body.perSeat, "Price per seat", 1e9),
    wholeJet: num(body.wholeJet, "Whole jet price", 1e10),
    booked: Boolean(body.booked),
    image: image(body.image),
  };
}

/** Validate a partial patch (POST). Only supplied keys are touched. */
export function validateDealPatch(body: any) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Invalid request body");
  }

  const patch: Record<string, unknown> = {};

  if ("from" in body) patch.from = text(body.from, "Origin", true);
  if ("to" in body) patch.to = text(body.to, "Destination", true);
  if ("plane" in body) patch.plane = text(body.plane, "Aircraft type", false);
  if ("date" in body) patch.date = text(body.date, "Date", false);
  if ("time" in body) patch.time = text(body.time, "Time", false);
  if ("seater" in body) patch.seater = num(body.seater, "Seats", 1000);
  if ("perSeat" in body) patch.perSeat = num(body.perSeat, "Price per seat", 1e9);
  if ("wholeJet" in body) patch.wholeJet = num(body.wholeJet, "Whole jet price", 1e10);
  if ("booked" in body) patch.booked = Boolean(body.booked);
  if ("isDeleted" in body) patch.isDeleted = Boolean(body.isDeleted);
  if ("image" in body) patch.image = image(body.image);

  return patch;
}

/** Deal ids are positive integers; reject NaN and floats. */
export function parseDealId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("A valid deal ID is required");
  }
  return id;
}
