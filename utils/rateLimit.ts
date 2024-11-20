interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: { [key: string]: number[] } = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    if (!this.requests[key]) {
      this.requests[key] = [now];
      return false;
    }

    // Remove timestamps outside the window
    this.requests[key] = this.requests[key].filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (this.requests[key].length >= this.maxRequests) {
      return true;
    }

    this.requests[key].push(now);
    return false;
  }

  reset(key: string): void {
    delete this.requests[key];
  }
}

const defaultLimiter = new RateLimiter({
  maxRequests: 100,  // Maximum requests per window
  windowMs: 60000    // Window size in milliseconds (1 minute)
});

export const rateLimit = {
  isLimited: (key: string) => defaultLimiter.isRateLimited(key),
  reset: (key: string) => defaultLimiter.reset(key)
};
