// Fixed-window rate limiting, in-process.
//
// SCOPE: counters live in this process's memory. That covers a single Node
// server (the current setup). Behind multiple instances or on serverless,
// each instance keeps its own counter and the effective limit multiplies —
// move to Redis/Upstash before relying on this in that topology.

export interface RateLimitRule {
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  // Auth is the most abusable surface: each attempt costs an outbound call to
  // Google, so it gets the tightest budget.
  auth: { limit: 10, windowSeconds: 15 * 60 },
  // Writes touch the datastore.
  mutation: { limit: 30, windowSeconds: 60 },
  // Public reads.
  read: { limit: 120, windowSeconds: 60 },
} satisfies Record<string, RateLimitRule>;

interface Counter {
  count: number;
  resetAt: number; // epoch ms
}

const counters = new Map<string, Counter>();
let lastSweep = Date.now();

/** Drop expired counters so the map cannot grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, counter] of counters) {
    if (counter.resetAt <= now) counters.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  bucket: keyof typeof RATE_LIMITS
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const rule = RATE_LIMITS[bucket];
  const key = `${bucket}:${identifier}`;
  const existing = counters.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + rule.windowSeconds * 1000;
    counters.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      retryAfterSeconds: 0,
      resetAt,
    };
  }

  existing.count += 1;
  const allowed = existing.count <= rule.limit;

  return {
    allowed,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - existing.count),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    resetAt: existing.resetAt,
  };
}

/**
 * Best-effort client IP. `x-forwarded-for` is only trustworthy behind a proxy
 * that overwrites it; direct-to-Node deployments should not trust it. Falls
 * back to a shared bucket rather than letting an unknown client bypass limits.
 */
export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
  if (!result.allowed) headers["Retry-After"] = String(result.retryAfterSeconds);
  return headers;
}
