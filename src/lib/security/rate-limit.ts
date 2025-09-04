// Simple in-memory rate limiter (per-process). For multi-instance, back with Redis later.

export interface RateLimitOptions {
  windowMs: number;        // e.g., 60000 for 1 minute window
  max: number;             // max requests per window per key
  minIntervalMs?: number;  // minimal delay between consecutive requests from same key
}

type RateEntry = {
  windowStart: number;
  count: number;
  lastRequest: number;
};

class InMemoryRateLimiter {
  private store: Map<string, RateEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // periodic cleanup to prevent unbounded growth
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (this.cleanupInterval && typeof this.cleanupInterval.unref === 'function') {
      this.cleanupInterval.unref();
    }
  }

  public check(key: string, options: RateLimitOptions, now: number = Date.now()): { allowed: boolean; retryAfterMs: number } {
    const { windowMs, max, minIntervalMs = 0 } = options;
    const entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, { windowStart: now, count: 1, lastRequest: now });
      return { allowed: true, retryAfterMs: 0 };
    }

    // enforce minimal interval between consecutive requests
    const sinceLast = now - entry.lastRequest;
    if (minIntervalMs > 0 && sinceLast < minIntervalMs) {
      return { allowed: false, retryAfterMs: Math.max(minIntervalMs - sinceLast, 0) };
    }

    // within same window
    if (now - entry.windowStart < windowMs) {
      if (entry.count >= max) {
        const retryAfterMs = entry.windowStart + windowMs - now;
        return { allowed: false, retryAfterMs };
      }
      entry.count += 1;
      entry.lastRequest = now;
      this.store.set(key, entry);
      return { allowed: true, retryAfterMs: 0 };
    }

    // new window
    this.store.set(key, { windowStart: now, count: 1, lastRequest: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      // remove entries idle for more than 10 minutes
      if (now - entry.lastRequest > 10 * 60 * 1000) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

// Helper to extract client IP from Next.js request headers
export function getClientIpFromHeaders(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return 'unknown';
}


