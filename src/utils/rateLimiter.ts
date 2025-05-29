
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    if (!this.requests.has(identifier)) {
      return config.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier)!;
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, config.maxRequests - validRequests.length);
  }

  clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RATE_LIMITS = {
  NEWS_FETCH: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  API_CALLS: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  SEARCH: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 searches per minute
};
