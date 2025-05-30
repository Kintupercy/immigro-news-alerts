
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  lastAccessed: number;
  hitCount: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class EnhancedCacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items
  private stats = { hits: 0, misses: 0 };

  set<T>(key: string, data: T, ttlMinutes: number = 10): void {
    // Clean up if we're at max capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
      lastAccessed: Date.now(),
      hitCount: 0
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    item.lastAccessed = Date.now();
    item.hitCount++;
    this.stats.hits++;
    
    return item.data;
  }

  // Preload data for anticipated requests
  async preload<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttlMinutes: number = 10
  ): Promise<void> {
    if (!this.has(key)) {
      try {
        const data = await fetchFn();
        this.set(key, data, ttlMinutes);
      } catch (error) {
        console.warn(`Failed to preload cache for key: ${key}`, error);
      }
    }
  }

  // Background refresh for hot data
  async backgroundRefresh<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMinutes: number = 10
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    // Return cached data immediately if available
    if (cached) {
      // Trigger background refresh if data is older than half TTL
      const item = this.cache.get(key);
      if (item && Date.now() - item.timestamp > (item.ttl / 2)) {
        // Background refresh (don't await)
        fetchFn().then(data => this.set(key, data, ttlMinutes))
          .catch(error => console.warn(`Background refresh failed for ${key}:`, error));
      }
      return cached;
    }
    
    // No cached data, fetch synchronously
    const data = await fetchFn();
    this.set(key, data, ttlMinutes);
    return data;
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedScore = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      // Score based on last accessed time and hit count
      const score = item.lastAccessed - (item.hitCount * 1000 * 60 * 60); // Bias towards frequently used
      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  // Bulk operations
  async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = this.get<T>(key);
    }
    return result;
  }

  setMany<T>(items: Array<{ key: string; data: T; ttlMinutes?: number }>): void {
    for (const item of items) {
      this.set(item.key, item.data, item.ttlMinutes);
    }
  }

  // Get cached data or fetch and cache with retry logic
  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttlMinutes: number = 10,
    retries: number = 2
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const data = await fetchFn();
        this.set(key, data, ttlMinutes);
        return data;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('Failed to fetch data');
  }
}

export const enhancedCache = new EnhancedCacheManager();

// Cache key generators for consistent naming
export const cacheKeys = {
  news: (category: string, search?: string) => 
    `news_${category}${search ? `_search_${search}` : ''}`,
  categories: () => 'immigration_categories',
  userProfile: (userId: string) => `user_profile_${userId}`,
  bookmarks: (userId: string) => `bookmarks_${userId}`,
  personalizedNews: (userId: string, preferences: string[]) => 
    `personalized_news_${userId}_${preferences.sort().join('_')}`,
};
