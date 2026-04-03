/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per-IP using a sliding window.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const entries = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, entry] of entries) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) {
      entries.delete(key);
    }
  }
}, 300_000);

export interface RateLimitOptions {
  /** Max requests per window */
  maxRequests: number;
  /** Window duration in ms */
  windowMs: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 10,
  windowMs: 60_000, // 1 minute
};

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = DEFAULT_OPTIONS,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - options.windowMs;

  let entry = entries.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    entries.set(ip, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => t > cutoff);

  if (entry.timestamps.length >= options.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + options.windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}
