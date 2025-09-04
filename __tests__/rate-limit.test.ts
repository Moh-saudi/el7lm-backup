import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

describe('rateLimiter', () => {
  it('allows first request and blocks after reaching max within window', () => {
    const key = 'test:key';
    const now = Date.now();
    const opts = { windowMs: 1000, max: 3, minIntervalMs: 0 };

    expect(rateLimiter.check(key, opts, now).allowed).toBe(true);
    expect(rateLimiter.check(key, opts, now + 10).allowed).toBe(true);
    expect(rateLimiter.check(key, opts, now + 20).allowed).toBe(true);
    const fourth = rateLimiter.check(key, opts, now + 30);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets after window passes', () => {
    const key = 'test:key2';
    const start = Date.now();
    const opts = { windowMs: 50, max: 1, minIntervalMs: 0 };
    expect(rateLimiter.check(key, opts, start).allowed).toBe(true);
    const blocked = rateLimiter.check(key, opts, start + 10);
    expect(blocked.allowed).toBe(false);
    const after = rateLimiter.check(key, opts, start + 60);
    expect(after.allowed).toBe(true);
  });

  it('enforces minimal interval', () => {
    const key = 'test:key3';
    const start = Date.now();
    const opts = { windowMs: 1000, max: 100, minIntervalMs: 200 };
    expect(rateLimiter.check(key, opts, start).allowed).toBe(true);
    const tooSoon = rateLimiter.check(key, opts, start + 100);
    expect(tooSoon.allowed).toBe(false);
    const ok = rateLimiter.check(key, opts, start + 220);
    expect(ok.allowed).toBe(true);
  });
});

describe('getClientIpFromHeaders', () => {
  it('parses x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIpFromHeaders(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip and cf-connecting-ip', () => {
    expect(getClientIpFromHeaders(new Headers({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
    expect(getClientIpFromHeaders(new Headers({ 'cf-connecting-ip': '8.8.8.8' }))).toBe('8.8.8.8');
  });
});


