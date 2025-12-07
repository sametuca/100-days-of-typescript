// Day 48: Advanced Caching Types

export interface CacheItem<T = any> {
    data: T;
    expiry: number;
    createdAt: number;
    accessCount: number;
    lastAccessed: number;
    size?: number; // Approximate size in bytes
}

export interface LayerStats {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
    maxSize: number;
    itemCount: number;
    hitRate: number; // Percentage
    memoryUsage?: number; // Bytes
}

export interface OverallStats {
    totalHits: number;
    totalMisses: number;
    totalEvictions: number;
    overallHitRate: number;
    l1HitRate: number;
    l2HitRate: number;
    totalMemoryUsage: number;
    uptime: number; // Seconds
}

export interface CacheStats {
    l1: LayerStats;
    l2: LayerStats;
    overall: OverallStats;
    timestamp: Date;
}

export interface CacheConfig {
    l1MaxSize: number; // Maximum number of items in L1
    l2MaxSize: number; // Maximum number of items in L2
    defaultTTL: number; // Default TTL in seconds
    enableL2: boolean; // Enable/disable L2 cache
    l2Directory: string; // Directory for L2 cache files
    compressionEnabled: boolean; // Enable compression for L2
    warmupEnabled: boolean; // Enable cache warming on startup
}

export interface CacheHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    l1Status: 'ok' | 'full' | 'error';
    l2Status: 'ok' | 'full' | 'error' | 'disabled';
    issues: string[];
    recommendations: string[];
}

export interface CacheWarmupConfig {
    enabled: boolean;
    endpoints: string[];
    delay: number; // Delay between requests in ms
}

export enum CacheStrategy {
    CACHE_ASIDE = 'cache-aside',
    WRITE_THROUGH = 'write-through',
    WRITE_BACK = 'write-back',
    REFRESH_AHEAD = 'refresh-ahead'
}

export interface CacheOperation {
    type: 'get' | 'set' | 'delete' | 'clear';
    key: string;
    hit: boolean;
    layer?: 'l1' | 'l2';
    duration: number; // Operation duration in ms
    timestamp: Date;
}

export interface LRUNode<T = any> {
    key: string;
    value: CacheItem<T>;
    prev: LRUNode<T> | null;
    next: LRUNode<T> | null;
}
