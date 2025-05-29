
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Get cached data or fetch and cache
  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttlMinutes: number = 10
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;

    const data = await fetchFn();
    this.set(key, data, ttlMinutes);
    return data;
  }
}

export const cache = new CacheManager();
