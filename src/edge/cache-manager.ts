import { CacheOptions } from './types';

interface CacheEntry {
  response: Response;
  createdAt: number;
  expiresAt?: number;
  staleAt?: number;
  tags: string[];
  needsRevalidation: boolean;
}

export class EdgeCacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<Response | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Check stale-while-revalidate
    if (entry.staleAt && Date.now() > entry.staleAt) {
      // Return stale content but trigger revalidation
      entry.needsRevalidation = true;
    }

    return entry.response.clone();
  }

  async set(
    key: string,
    response: Response,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl ?? 3600; // Default 1 hour
    const now = Date.now();

    const entry: CacheEntry = {
      response: response.clone(),
      createdAt: now,
      expiresAt: now + ttl * 1000,
      staleAt: options.staleWhileRevalidate
        ? now + (ttl - options.staleWhileRevalidate) * 1000
        : undefined,
      tags: options.tags ?? [],
      needsRevalidation: false
    };

    this.cache.set(key, entry);
  }

  async purge(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async purgeByTag(tag: string): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  async purgeAll(): Promise<void> {
    this.cache.clear();
  }

  getCacheKey(request: Request): string {
    const url = new URL(request.url);
    return `${request.method}:${url.pathname}${url.search}`;
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
