// Day 48: Advanced Cache Service Tests

import { AdvancedCacheService } from '../../src/services/cache.service';
import * as fs from 'fs';
import * as path from 'path';

describe('AdvancedCacheService', () => {
    let cacheService: AdvancedCacheService;
    const testCacheDir = 'data/cache-test';

    beforeEach(() => {
        // Create fresh cache instance for each test
        cacheService = new AdvancedCacheService({
            l1MaxSize: 10,
            l2MaxSize: 20,
            defaultTTL: 60,
            enableL2: true,
            l2Directory: testCacheDir,
            compressionEnabled: false,
            warmupEnabled: false
        });
    });

    afterEach(() => {
        // Clean up
        cacheService.clear();

        // Remove test cache directory
        try {
            if (fs.existsSync(testCacheDir)) {
                const files = fs.readdirSync(testCacheDir);
                files.forEach(file => {
                    try {
                        fs.unlinkSync(path.join(testCacheDir, file));
                    } catch (err) {
                        // Ignore file deletion errors
                    }
                });
                try {
                    fs.rmdirSync(testCacheDir);
                } catch (err) {
                    // Ignore directory deletion errors
                }
            }
        } catch (err) {
            // Ignore cleanup errors
        }
    });

    describe('L1 Cache Operations', () => {
        it('should set and get data from L1 cache', () => {
            cacheService.set('test-key', { value: 'test-data' }, 60);
            const result = cacheService.get('test-key');

            expect(result).toEqual({ value: 'test-data' });
        });

        it('should return null for non-existent keys', () => {
            const result = cacheService.get('non-existent');
            expect(result).toBeNull();
        });

        it('should delete cache entries', () => {
            cacheService.set('test-key', 'test-data', 60);
            cacheService.delete('test-key');

            const result = cacheService.get('test-key');
            expect(result).toBeNull();
        });

        it('should clear all cache', () => {
            cacheService.set('key1', 'data1', 60);
            cacheService.set('key2', 'data2', 60);

            cacheService.clear();

            expect(cacheService.get('key1')).toBeNull();
            expect(cacheService.get('key2')).toBeNull();
        });

        it('should handle TTL expiration', (done) => {
            cacheService.set('expiring-key', 'data', 1); // 1 second TTL

            setTimeout(() => {
                const result = cacheService.get('expiring-key');
                expect(result).toBeNull();
                done();
            }, 1100);
        });
    });

    describe('LRU Eviction', () => {
        it('should evict least recently used items when cache is full', () => {
            // Fill cache to max (10 items)
            for (let i = 0; i < 10; i++) {
                cacheService.set(`key${i}`, `data${i}`, 60);
            }

            // Add one more item, should evict key0
            cacheService.set('key10', 'data10', 60);

            const stats = cacheService.getStats();
            expect(stats.l1.size).toBe(10);
            expect(stats.l1.evictions).toBe(1);
            expect(cacheService.get('key0')).toBeNull();
            expect(cacheService.get('key10')).not.toBeNull();
        });

        it('should update LRU order on access', () => {
            // Fill cache
            for (let i = 0; i < 10; i++) {
                cacheService.set(`key${i}`, `data${i}`, 60);
            }

            // Access key0 to make it most recently used
            cacheService.get('key0');

            // Add new item, should evict key1 (now least recently used)
            cacheService.set('key10', 'data10', 60);

            expect(cacheService.get('key0')).not.toBeNull();
            expect(cacheService.get('key1')).toBeNull();
        });
    });

    describe('Pattern Deletion', () => {
        it('should delete cache entries matching pattern', () => {
            cacheService.set('user:1:profile', 'data1', 60);
            cacheService.set('user:2:profile', 'data2', 60);
            cacheService.set('task:1:details', 'data3', 60);

            cacheService.deletePattern('user:*');

            expect(cacheService.get('user:1:profile')).toBeNull();
            expect(cacheService.get('user:2:profile')).toBeNull();
            expect(cacheService.get('task:1:details')).not.toBeNull();
        });
    });

    describe('Statistics', () => {
        it('should track cache hits and misses', () => {
            cacheService.set('key1', 'data1', 60);

            // Hit
            cacheService.get('key1');

            // Miss
            cacheService.get('key2');

            const stats = cacheService.getStats();
            expect(stats.l1.hits).toBe(1);
            expect(stats.l1.misses).toBe(1);
            expect(stats.l1.hitRate).toBe(50);
        });

        it('should track overall statistics', () => {
            cacheService.set('key1', 'data1', 60);
            cacheService.set('key2', 'data2', 60);

            cacheService.get('key1'); // L1 hit
            cacheService.get('key2'); // L1 hit
            cacheService.get('key3'); // L1 miss

            const stats = cacheService.getStats();
            expect(stats.overall.totalHits).toBeGreaterThanOrEqual(2);
            expect(stats.overall.totalMisses).toBeGreaterThanOrEqual(1);
            expect(stats.overall.overallHitRate).toBeGreaterThan(0);
        });
    });

    describe('Health Check', () => {
        it('should report healthy status for normal cache', () => {
            cacheService.set('key1', 'data1', 60);

            const health = cacheService.getHealth();
            expect(health.status).toBe('healthy');
            expect(health.l1Status).toBe('ok');
        });

        it('should report degraded status when cache is nearly full', () => {
            // Fill cache to 90%+ capacity
            for (let i = 0; i < 9; i++) {
                cacheService.set(`key${i}`, `data${i}`, 60);
            }

            const health = cacheService.getHealth();
            expect(health.l1Status).toBe('full');
            expect(health.issues.length).toBeGreaterThan(0);
            expect(health.recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('Keys Management', () => {
        it('should return all cache keys', () => {
            cacheService.set('key1', 'data1', 60);
            cacheService.set('key2', 'data2', 60);
            cacheService.set('key3', 'data3', 60);

            const keys = cacheService.keys();
            expect(keys).toContain('key1');
            expect(keys).toContain('key2');
            expect(keys).toContain('key3');
            expect(keys.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('Data Types', () => {
        it('should handle different data types', () => {
            const testData = {
                string: 'test',
                number: 123,
                boolean: true,
                array: [1, 2, 3],
                object: { nested: 'value' }
            };

            cacheService.set('test-key', testData, 60);
            const result = cacheService.get('test-key');

            expect(result).toEqual(testData);
        });

        it('should handle null and undefined', () => {
            cacheService.set('null-key', null, 60);
            cacheService.set('undefined-key', undefined, 60);

            expect(cacheService.get('null-key')).toBeNull();
            expect(cacheService.get('undefined-key')).toBeUndefined();
        });
    });

    describe('Access Count Tracking', () => {
        it('should track access count for cache items', () => {
            cacheService.set('key1', 'data1', 60);

            // Access multiple times
            cacheService.get('key1');
            cacheService.get('key1');
            cacheService.get('key1');

            const stats = cacheService.getStats();
            expect(stats.l1.hits).toBe(3);
        });
    });
});
