// Day 48: Advanced Multi-Layer Cache Service with LRU Eviction

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
import {
  CacheItem,
  CacheStats,
  CacheConfig,
  CacheHealth,
  LayerStats,
  OverallStats,
  LRUNode
} from '../types/cache.types';

const gzip = promisify(zlib.gzip);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);

class LRUCache<T = any> {
  private cache = new Map<string, LRUNode<T>>();
  private head: LRUNode<T> | null = null;
  private tail: LRUNode<T> | null = null;
  private maxSize: number;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): CacheItem<T> | null {
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      return null;
    }

    // Check expiry
    if (Date.now() > node.value.expiry) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Move to front (most recently used)
    this.moveToFront(node);

    // Update access stats
    node.value.accessCount++;
    node.value.lastAccessed = Date.now();

    this.hits++;
    return node.value;
  }

  set(key: string, data: T, ttl: number): void {
    const existing = this.cache.get(key);

    if (existing) {
      // Update existing
      existing.value.data = data;
      existing.value.expiry = Date.now() + ttl * 1000;
      existing.value.lastAccessed = Date.now();
      this.moveToFront(existing);
      return;
    }

    // Create new node
    const newNode: LRUNode<T> = {
      key,
      value: {
        data,
        expiry: Date.now() + ttl * 1000,
        createdAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now()
      },
      prev: null,
      next: null
    };

    // Add to cache
    this.cache.set(key, newNode);
    this.addToFront(newNode);

    // Evict if necessary
    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats(): LayerStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      size: this.cache.size,
      maxSize: this.maxSize,
      itemCount: this.cache.size,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0
    };
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  private moveToFront(node: LRUNode<T>): void {
    if (node === this.head) return;

    this.removeNode(node);
    this.addToFront(node);
  }

  private addToFront(node: LRUNode<T>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evictLRU(): void {
    if (!this.tail) return;

    const evicted = this.tail;
    this.removeNode(evicted);
    this.cache.delete(evicted.key);
    this.evictions++;
  }
}

export class AdvancedCacheService {
  private l1Cache: LRUCache;
  private l2Cache = new Map<string, CacheItem>();
  private config: CacheConfig;
  private startTime: number;
  private l2Hits = 0;
  private l2Misses = 0;
  private l2Evictions = 0;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      l1MaxSize: config?.l1MaxSize || 1000,
      l2MaxSize: config?.l2MaxSize || 5000,
      defaultTTL: config?.defaultTTL || 300,
      enableL2: config?.enableL2 !== false,
      l2Directory: config?.l2Directory || 'data/cache',
      compressionEnabled: config?.compressionEnabled !== false,
      warmupEnabled: config?.warmupEnabled || false
    };

    this.l1Cache = new LRUCache(this.config.l1MaxSize);
    this.startTime = Date.now();

    // Ensure L2 directory exists
    if (this.config.enableL2) {
      this.ensureL2Directory();
    }
  }

  // Main cache operations
  set(key: string, data: any, ttl?: number): void {
    const effectiveTTL = ttl || this.config.defaultTTL;

    // Set in L1
    this.l1Cache.set(key, data, effectiveTTL);

    // Set in L2 if enabled
    if (this.config.enableL2) {
      this.setL2(key, data, effectiveTTL);
    }
  }

  get<T>(key: string): T | null {
    // Try L1 first
    const l1Result = this.l1Cache.get(key);
    if (l1Result) {
      return l1Result.data as T;
    }

    // Try L2 if enabled
    if (this.config.enableL2) {
      const l2Result = this.getL2<T>(key);
      if (l2Result) {
        // Promote to L1
        this.l1Cache.set(key, l2Result, this.config.defaultTTL);
        this.l2Hits++;
        return l2Result;
      }
      this.l2Misses++;
    }

    return null;
  }

  delete(key: string): void {
    this.l1Cache.delete(key);

    if (this.config.enableL2) {
      this.deleteL2(key);
    }
  }

  clear(): void {
    this.l1Cache.clear();

    if (this.config.enableL2) {
      this.clearL2();
    }

    this.l2Hits = 0;
    this.l2Misses = 0;
    this.l2Evictions = 0;
  }

  // Pattern-based deletion
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));

    // Delete from L1
    const l1Keys = this.l1Cache.keys();
    for (const key of l1Keys) {
      if (regex.test(key)) {
        this.l1Cache.delete(key);
      }
    }

    // Delete from L2
    if (this.config.enableL2) {
      const l2Keys = Array.from(this.l2Cache.keys());
      for (const key of l2Keys) {
        if (regex.test(key)) {
          this.deleteL2(key);
        }
      }
    }
  }

  // Statistics
  getStats(): CacheStats {
    const l1Stats = this.l1Cache.getStats();
    const l2Total = this.l2Hits + this.l2Misses;

    const l2Stats: LayerStats = {
      hits: this.l2Hits,
      misses: this.l2Misses,
      evictions: this.l2Evictions,
      size: this.l2Cache.size,
      maxSize: this.config.l2MaxSize,
      itemCount: this.l2Cache.size,
      hitRate: l2Total > 0 ? (this.l2Hits / l2Total) * 100 : 0
    };

    const totalHits = l1Stats.hits + this.l2Hits;
    const totalMisses = l1Stats.misses + this.l2Misses;
    const total = totalHits + totalMisses;

    const overall: OverallStats = {
      totalHits,
      totalMisses,
      totalEvictions: l1Stats.evictions + this.l2Evictions,
      overallHitRate: total > 0 ? (totalHits / total) * 100 : 0,
      l1HitRate: l1Stats.hitRate,
      l2HitRate: l2Stats.hitRate,
      totalMemoryUsage: this.estimateMemoryUsage(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000)
    };

    return {
      l1: l1Stats,
      l2: l2Stats,
      overall,
      timestamp: new Date()
    };
  }

  // Health check
  getHealth(): CacheHealth {
    const stats = this.getStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check L1 status
    let l1Status: 'ok' | 'full' | 'error' = 'ok';
    if (stats.l1.size >= stats.l1.maxSize * 0.9) {
      l1Status = 'full';
      issues.push('L1 cache is 90% full');
      recommendations.push('Consider increasing L1 max size or reducing TTL');
    }

    // Check L2 status
    let l2Status: 'ok' | 'full' | 'error' | 'disabled' = this.config.enableL2 ? 'ok' : 'disabled';
    if (this.config.enableL2 && stats.l2.size >= stats.l2.maxSize * 0.9) {
      l2Status = 'full';
      issues.push('L2 cache is 90% full');
      recommendations.push('Consider increasing L2 max size or implementing cleanup');
    }

    // Check hit rate
    if (stats.overall.overallHitRate < 50 && stats.overall.totalHits + stats.overall.totalMisses > 100) {
      issues.push(`Low cache hit rate: ${stats.overall.overallHitRate.toFixed(2)}%`);
      recommendations.push('Review cache TTL settings and cache warming strategy');
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      l1Status,
      l2Status,
      issues,
      recommendations
    };
  }

  // Get all keys
  keys(): string[] {
    const l1Keys = new Set(this.l1Cache.keys());
    const l2Keys = new Set(this.l2Cache.keys());
    return Array.from(new Set([...l1Keys, ...l2Keys]));
  }

  // L2 Cache operations (file-based)
  private setL2(key: string, data: any, ttl: number): void {
    const item: CacheItem = {
      data,
      expiry: Date.now() + ttl * 1000,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.l2Cache.set(key, item);

    // Evict if necessary
    if (this.l2Cache.size > this.config.l2MaxSize) {
      this.evictL2();
    }

    // Persist to disk (async, non-blocking)
    this.persistL2Item(key, item).catch(err => {
      console.error('L2 cache persist error:', err);
    });
  }

  private getL2<T>(key: string): T | null {
    const item = this.l2Cache.get(key);

    if (!item) return null;

    // Check expiry
    if (Date.now() > item.expiry) {
      this.deleteL2(key);
      return null;
    }

    // Update access stats
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.data as T;
  }

  private deleteL2(key: string): void {
    this.l2Cache.delete(key);

    // Delete from disk (async, non-blocking)
    const filePath = this.getL2FilePath(key);
    unlink(filePath).catch(() => {
      // Ignore errors if file doesn't exist
    });
  }

  private clearL2(): void {
    this.l2Cache.clear();

    // Clear disk cache (async, non-blocking)
    this.clearL2Directory().catch(err => {
      console.error('L2 cache clear error:', err);
    });
  }

  private evictL2(): void {
    // Simple LRU eviction for L2
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.l2Cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.deleteL2(oldestKey);
      this.l2Evictions++;
    }
  }

  private async persistL2Item(key: string, item: CacheItem): Promise<void> {
    const filePath = this.getL2FilePath(key);
    const data = JSON.stringify(item);

    if (this.config.compressionEnabled) {
      const compressed = await gzip(Buffer.from(data));
      await writeFile(filePath + '.gz', compressed);
    } else {
      await writeFile(filePath, data);
    }
  }

  private getL2FilePath(key: string): string {
    const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
    return path.join(this.config.l2Directory, `${safeKey}.json`);
  }

  private ensureL2Directory(): void {
    if (!fs.existsSync(this.config.l2Directory)) {
      fs.mkdirSync(this.config.l2Directory, { recursive: true });
    }
  }

  private async clearL2Directory(): Promise<void> {
    if (!fs.existsSync(this.config.l2Directory)) return;

    const files = await readdir(this.config.l2Directory);
    await Promise.all(
      files.map(file =>
        unlink(path.join(this.config.l2Directory, file)).catch(() => { })
      )
    );
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    const l1Size = this.l1Cache.keys().length * 1024; // Assume 1KB per item
    const l2Size = this.l2Cache.size * 512; // L2 is lighter in memory
    return l1Size + l2Size;
  }
}

// Export singleton instance with backward compatibility
export const cacheService = new AdvancedCacheService();

// Also export the class for testing
export { AdvancedCacheService as CacheService };