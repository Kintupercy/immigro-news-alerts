
import { rateLimiter, RATE_LIMITS } from './rateLimiter';

// Enhanced rate limiter with IP tracking and progressive delays
class EnhancedRateLimiter {
  private attempts = new Map<string, { count: number; firstAttempt: number; lastAttempt: number }>();
  
  checkLimit(identifier: string, action: 'auth' | 'api' | 'search'): { 
    allowed: boolean; 
    remainingAttempts: number; 
    resetTime?: number;
    progressiveDelay?: number;
  } {
    const config = this.getConfigForAction(action);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get or initialize attempt tracking
    let attemptData = this.attempts.get(identifier);
    if (!attemptData || attemptData.firstAttempt < windowStart) {
      attemptData = { count: 0, firstAttempt: now, lastAttempt: now };
    }
    
    // Increment attempt count
    attemptData.count += 1;
    attemptData.lastAttempt = now;
    this.attempts.set(identifier, attemptData);
    
    const allowed = attemptData.count <= config.maxRequests;
    const remainingAttempts = Math.max(0, config.maxRequests - attemptData.count);
    
    // Calculate progressive delay (exponential backoff)
    const progressiveDelay = allowed ? 0 : Math.min(
      Math.pow(2, attemptData.count - config.maxRequests) * 1000,
      30000 // Max 30 seconds
    );
    
    const resetTime = attemptData.firstAttempt + config.windowMs;
    
    return {
      allowed,
      remainingAttempts,
      resetTime,
      progressiveDelay
    };
  }
  
  private getConfigForAction(action: string) {
    switch (action) {
      case 'auth':
        return { maxRequests: 5, windowMs: 15 * 60 * 1000 }; // 5 attempts per 15 minutes
      case 'api':
        return RATE_LIMITS.API_CALLS;
      case 'search':
        return RATE_LIMITS.SEARCH;
      default:
        return RATE_LIMITS.API_CALLS;
    }
  }
  
  // Get client IP address (best effort)
  getClientIdentifier(request?: Request): string {
    if (typeof window !== 'undefined') {
      // Browser environment - use a combination of factors
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset()
      ].join('|');
      
      return btoa(fingerprint).slice(0, 32);
    }
    
    // Server environment
    if (request) {
      return request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
    }
    
    return 'unknown';
  }
  
  // Clean up old entries
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    for (const [key, data] of this.attempts.entries()) {
      if (now - data.lastAttempt > maxAge) {
        this.attempts.delete(key);
      }
    }
  }
}

export const enhancedRateLimiter = new EnhancedRateLimiter();

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    enhancedRateLimiter.cleanup();
  }, 10 * 60 * 1000);
}
