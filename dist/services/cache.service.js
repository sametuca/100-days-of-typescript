"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = exports.cacheService = exports.AdvancedCacheService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib.gzip);
const writeFile = (0, util_1.promisify)(fs.writeFile);
const unlink = (0, util_1.promisify)(fs.unlink);
const readdir = (0, util_1.promisify)(fs.readdir);
class LRUCache {
    constructor(maxSize) {
        this.cache = new Map();
        this.head = null;
        this.tail = null;
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
        this.maxSize = maxSize;
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            this.misses++;
            return null;
        }
        if (Date.now() > node.value.expiry) {
            this.delete(key);
            this.misses++;
            return null;
        }
        this.moveToFront(node);
        node.value.accessCount++;
        node.value.lastAccessed = Date.now();
        this.hits++;
        return node.value;
    }
    set(key, data, ttl) {
        const existing = this.cache.get(key);
        if (existing) {
            existing.value.data = data;
            existing.value.expiry = Date.now() + ttl * 1000;
            existing.value.lastAccessed = Date.now();
            this.moveToFront(existing);
            return;
        }
        const newNode = {
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
        this.cache.set(key, newNode);
        this.addToFront(newNode);
        if (this.cache.size > this.maxSize) {
            this.evictLRU();
        }
    }
    delete(key) {
        const node = this.cache.get(key);
        if (!node)
            return false;
        this.removeNode(node);
        this.cache.delete(key);
        return true;
    }
    clear() {
        this.cache.clear();
        this.head = null;
        this.tail = null;
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }
    getStats() {
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
    keys() {
        return Array.from(this.cache.keys());
    }
    has(key) {
        return this.cache.has(key);
    }
    moveToFront(node) {
        if (node === this.head)
            return;
        this.removeNode(node);
        this.addToFront(node);
    }
    addToFront(node) {
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
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
    }
    evictLRU() {
        if (!this.tail)
            return;
        const evicted = this.tail;
        this.removeNode(evicted);
        this.cache.delete(evicted.key);
        this.evictions++;
    }
}
class AdvancedCacheService {
    constructor(config) {
        this.l2Cache = new Map();
        this.l2Hits = 0;
        this.l2Misses = 0;
        this.l2Evictions = 0;
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
        if (this.config.enableL2) {
            this.ensureL2Directory();
        }
    }
    set(key, data, ttl) {
        const effectiveTTL = ttl || this.config.defaultTTL;
        this.l1Cache.set(key, data, effectiveTTL);
        if (this.config.enableL2) {
            this.setL2(key, data, effectiveTTL);
        }
    }
    get(key) {
        const l1Result = this.l1Cache.get(key);
        if (l1Result) {
            return l1Result.data;
        }
        if (this.config.enableL2) {
            const l2Result = this.getL2(key);
            if (l2Result) {
                this.l1Cache.set(key, l2Result, this.config.defaultTTL);
                this.l2Hits++;
                return l2Result;
            }
            this.l2Misses++;
        }
        return null;
    }
    delete(key) {
        this.l1Cache.delete(key);
        if (this.config.enableL2) {
            this.deleteL2(key);
        }
    }
    clear() {
        this.l1Cache.clear();
        if (this.config.enableL2) {
            this.clearL2();
        }
        this.l2Hits = 0;
        this.l2Misses = 0;
        this.l2Evictions = 0;
    }
    deletePattern(pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        const l1Keys = this.l1Cache.keys();
        for (const key of l1Keys) {
            if (regex.test(key)) {
                this.l1Cache.delete(key);
            }
        }
        if (this.config.enableL2) {
            const l2Keys = Array.from(this.l2Cache.keys());
            for (const key of l2Keys) {
                if (regex.test(key)) {
                    this.deleteL2(key);
                }
            }
        }
    }
    getStats() {
        const l1Stats = this.l1Cache.getStats();
        const l2Total = this.l2Hits + this.l2Misses;
        const l2Stats = {
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
        const overall = {
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
    getHealth() {
        const stats = this.getStats();
        const issues = [];
        const recommendations = [];
        let l1Status = 'ok';
        if (stats.l1.size >= stats.l1.maxSize * 0.9) {
            l1Status = 'full';
            issues.push('L1 cache is 90% full');
            recommendations.push('Consider increasing L1 max size or reducing TTL');
        }
        let l2Status = this.config.enableL2 ? 'ok' : 'disabled';
        if (this.config.enableL2 && stats.l2.size >= stats.l2.maxSize * 0.9) {
            l2Status = 'full';
            issues.push('L2 cache is 90% full');
            recommendations.push('Consider increasing L2 max size or implementing cleanup');
        }
        if (stats.overall.overallHitRate < 50 && stats.overall.totalHits + stats.overall.totalMisses > 100) {
            issues.push(`Low cache hit rate: ${stats.overall.overallHitRate.toFixed(2)}%`);
            recommendations.push('Review cache TTL settings and cache warming strategy');
        }
        let status = 'healthy';
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
    keys() {
        const l1Keys = new Set(this.l1Cache.keys());
        const l2Keys = new Set(this.l2Cache.keys());
        return Array.from(new Set([...l1Keys, ...l2Keys]));
    }
    setL2(key, data, ttl) {
        const item = {
            data,
            expiry: Date.now() + ttl * 1000,
            createdAt: Date.now(),
            accessCount: 0,
            lastAccessed: Date.now()
        };
        this.l2Cache.set(key, item);
        if (this.l2Cache.size > this.config.l2MaxSize) {
            this.evictL2();
        }
        this.persistL2Item(key, item).catch(err => {
            console.error('L2 cache persist error:', err);
        });
    }
    getL2(key) {
        const item = this.l2Cache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry) {
            this.deleteL2(key);
            return null;
        }
        item.accessCount++;
        item.lastAccessed = Date.now();
        return item.data;
    }
    deleteL2(key) {
        this.l2Cache.delete(key);
        const filePath = this.getL2FilePath(key);
        unlink(filePath).catch(() => {
        });
    }
    clearL2() {
        this.l2Cache.clear();
        this.clearL2Directory().catch(err => {
            console.error('L2 cache clear error:', err);
        });
    }
    evictL2() {
        let oldestKey = null;
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
    async persistL2Item(key, item) {
        const filePath = this.getL2FilePath(key);
        const data = JSON.stringify(item);
        if (this.config.compressionEnabled) {
            const compressed = await gzip(Buffer.from(data));
            await writeFile(filePath + '.gz', compressed);
        }
        else {
            await writeFile(filePath, data);
        }
    }
    getL2FilePath(key) {
        const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
        return path.join(this.config.l2Directory, `${safeKey}.json`);
    }
    ensureL2Directory() {
        if (!fs.existsSync(this.config.l2Directory)) {
            fs.mkdirSync(this.config.l2Directory, { recursive: true });
        }
    }
    async clearL2Directory() {
        if (!fs.existsSync(this.config.l2Directory))
            return;
        const files = await readdir(this.config.l2Directory);
        await Promise.all(files.map(file => unlink(path.join(this.config.l2Directory, file)).catch(() => { })));
    }
    estimateMemoryUsage() {
        const l1Size = this.l1Cache.keys().length * 1024;
        const l2Size = this.l2Cache.size * 512;
        return l1Size + l2Size;
    }
}
exports.AdvancedCacheService = AdvancedCacheService;
exports.CacheService = AdvancedCacheService;
exports.cacheService = new AdvancedCacheService();
//# sourceMappingURL=cache.service.js.map