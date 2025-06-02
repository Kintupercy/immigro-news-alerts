export const cacheKeys = {
  news: (category: string, searchTerm: string, page: number = 1) => 
    `news:${category}:${searchTerm}:${page}`,
  personalizedNews: (userId: string, categories: string[], page: number = 1) => 
    `personalized:${userId}:${categories.join(',')}:${page}`,
  categories: () => 'categories',
  userProfile: (userId: string) => `profile:${userId}`,
  bookmarks: (userId: string) => `bookmarks:${userId}`,
  subscriptions: (email: string) => `subscription:${email}`,
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class EnhancedCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100;

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes: number = 10
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttlMinutes);
    return data;
  }

  async backgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes: number = 10
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    // If we have cached data, return it immediately and refresh in background
    if (cached) {
      // Refresh in background
      fetcher()
        .then(data => this.set(key, data, ttlMinutes))
        .catch(error => console.warn('Background refresh failed:', error));
      
      return cached;
    }

    // No cached data, fetch synchronously
    const data = await fetcher();
    this.set(key, data, ttlMinutes);
    return data;
  }

  private get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private set<T>(key: string, data: T, ttlMinutes: number): void {
    // Clean up old entries if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, { data, timestamp: Date.now(), expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.values()).filter(
      item => now <= item.expiry
    ).length;

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries: this.cache.size - validEntries,
    };
  }
}

export const enhancedCache = new EnhancedCache();
