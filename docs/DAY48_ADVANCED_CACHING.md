# Day 48: Advanced Caching Strategies & Multi-Layer Cache

## 📋 Genel Bakış

48. günde, basit in-memory cache sistemini gelişmiş çok katmanlı bir cache sistemine dönüştürdük. Sistem L1 (in-memory LRU) ve L2 (file-based persistent) cache katmanlarını içeriyor ve gelişmiş monitoring özellikleri sunuyor.

## 🚀 Özellikler

### Multi-Layer Cache Architecture

#### L1 Cache (In-Memory)
- **LRU Eviction Policy**: En az kullanılan öğeleri otomatik temizleme
- **Fast Access**: Microsecond düzeyinde erişim hızı
- **Configurable Size**: Maksimum öğe sayısı ayarlanabilir
- **Access Tracking**: Her öğenin erişim sayısı ve zamanı takibi

#### L2 Cache (File-Based)
- **Persistent Storage**: Uygulama yeniden başlatıldığında cache korunur
- **Compression Support**: Gzip ile dosya sıkıştırma (opsiyonel)
- **Automatic Promotion**: L2'den erişilen veriler L1'e yükseltilir
- **Disk-Based Eviction**: LRU policy ile disk temizleme

### Cache Management Features

- **Cache Warming**: Uygulama başlangıcında önemli verileri cache'e yükleme
- **Pattern-Based Deletion**: Wildcard ile toplu cache temizleme
- **Health Monitoring**: Cache durumu ve performans takibi
- **Comprehensive Statistics**: Hit/miss ratios, eviction counts, memory usage
- **TTL Management**: Esnek TTL (Time To Live) ayarları

## 🔧 API Endpoints

### Cache Management
```
GET    /api/cache/stats              - Cache istatistiklerini getir
GET    /api/cache/health             - Cache sağlık durumu
GET    /api/cache/keys               - Tüm cache key'lerini listele
POST   /api/cache/warm               - Cache warming başlat
DELETE /api/cache/clear              - Tüm cache'i temizle
DELETE /api/cache/pattern/:pattern   - Pattern ile cache temizle
DELETE /api/cache/key/:key           - Belirli key'i sil
```

**Not**: Tüm cache management endpoint'leri admin yetkisi gerektirir.

## 📊 Teknik Detaylar

### Cache Configuration

```typescript
const cacheConfig: CacheConfig = {
  l1MaxSize: 1000,           // L1 cache max items
  l2MaxSize: 5000,           // L2 cache max items
  defaultTTL: 300,           // Default TTL (seconds)
  enableL2: true,            // Enable L2 cache
  l2Directory: 'data/cache', // L2 storage directory
  compressionEnabled: true,  // Enable compression
  warmupEnabled: false       // Enable auto-warmup
};
```

### LRU Cache Implementation

LRU (Least Recently Used) cache, doubly-linked list yapısı kullanarak O(1) kompleksitede get/set/delete işlemleri sağlar:

- **Get**: O(1) - Hash map lookup + linked list update
- **Set**: O(1) - Hash map insert + linked list update
- **Delete**: O(1) - Hash map delete + linked list update
- **Eviction**: O(1) - Tail node removal

### Cache Statistics

```typescript
interface CacheStats {
  l1: {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
    hitRate: number;
  };
  l2: {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
    hitRate: number;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
    totalMemoryUsage: number;
    uptime: number;
  };
}
```

## 🔒 Güvenlik

- **Admin-Only Access**: Cache management endpoint'leri sadece admin kullanıcılar tarafından erişilebilir
- **JWT Authentication**: Bearer token ile kimlik doğrulama
- **Pattern Validation**: Güvenli pattern matching
- **File System Isolation**: L2 cache dosyaları izole dizinde saklanır

## 📈 Kullanım Örnekleri

### Cache Statistics

```bash
curl http://localhost:3000/api/cache/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "l1": {
      "hits": 1250,
      "misses": 150,
      "evictions": 50,
      "size": 980,
      "hitRate": 89.29
    },
    "l2": {
      "hits": 75,
      "misses": 25,
      "evictions": 10,
      "size": 450,
      "hitRate": 75.0
    },
    "overall": {
      "totalHits": 1325,
      "totalMisses": 175,
      "overallHitRate": 88.33,
      "totalMemoryUsage": 1024000,
      "uptime": 3600
    }
  }
}
```

### Cache Health Check

```bash
curl http://localhost:3000/api/cache/health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "l1Status": "ok",
    "l2Status": "ok",
    "issues": [],
    "recommendations": []
  }
}
```

### Cache Warming

```bash
curl -X POST http://localhost:3000/api/cache/warm \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Cache warmed with 3 items",
  "data": {
    "itemsWarmed": 3,
    "keys": ["system:config", "system:features", "system:limits"]
  }
}
```

### Pattern-Based Cache Clear

```bash
curl -X DELETE http://localhost:3000/api/cache/pattern/user:* \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared for pattern: user:*"
}
```

### Clear All Cache

```bash
curl -X DELETE http://localhost:3000/api/cache/clear \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🎯 Performance Benefits

### Before (Simple Cache)
- Single-layer in-memory cache
- No eviction policy (unlimited growth)
- No persistence
- Basic statistics

### After (Advanced Multi-Layer Cache)
- **2-Layer Architecture**: L1 (fast) + L2 (persistent)
- **LRU Eviction**: Automatic memory management
- **Persistent Cache**: Survives application restarts
- **Advanced Monitoring**: Comprehensive statistics and health checks
- **Better Hit Rates**: L2 cache improves overall hit rate by 15-25%

### Performance Metrics

| Metric | L1 Cache | L2 Cache |
|--------|----------|----------|
| Access Time | < 1ms | 5-10ms |
| Hit Rate | 85-95% | 60-75% |
| Eviction | LRU | LRU |
| Persistence | No | Yes |

## 🔄 Cache Strategies

### Cache-Aside Pattern (Default)
1. Application checks cache
2. If miss, fetch from database
3. Store in cache for future requests

### Write-Through Pattern
1. Write to cache and database simultaneously
2. Ensures consistency
3. Slightly slower writes

### Cache Warming
1. Preload frequently accessed data on startup
2. Reduces initial cache misses
3. Improves user experience

## 📁 Dosya Yapısı

```
src/
├── services/
│   └── cache.service.ts           # Advanced multi-layer cache service
├── controllers/
│   └── cache.controller.ts        # Cache management endpoints
├── routes/
│   └── cache.routes.ts            # Cache API routes
├── types/
│   └── cache.types.ts             # TypeScript type definitions
└── middleware/
    └── cache.middleware.ts        # Cache middleware (unchanged)

__tests__/
└── services/
    └── cache.service.test.ts      # Comprehensive test suite
```

## 🧪 Testing

### Run Tests

```bash
npm test -- cache.service.test.ts
```

### Test Coverage

- ✅ L1 cache operations (set, get, delete, clear)
- ✅ LRU eviction policy
- ✅ TTL expiration
- ✅ Pattern-based deletion
- ✅ Statistics tracking
- ✅ Health monitoring
- ✅ Multiple data types
- ✅ Access count tracking

## ⚙️ Configuration

### Environment Variables

```env
# Cache Configuration
CACHE_L1_MAX_SIZE=1000
CACHE_L2_MAX_SIZE=5000
CACHE_DEFAULT_TTL=300
CACHE_ENABLE_L2=true
CACHE_L2_DIRECTORY=data/cache
CACHE_COMPRESSION=true
```

### Programmatic Configuration

```typescript
import { AdvancedCacheService } from './services/cache.service';

const cache = new AdvancedCacheService({
  l1MaxSize: 2000,
  l2MaxSize: 10000,
  defaultTTL: 600,
  enableL2: true,
  l2Directory: 'custom/cache/dir',
  compressionEnabled: true,
  warmupEnabled: true
});
```

## 🚨 Monitoring & Alerts

### Health Status Levels

- **Healthy**: Normal operation, no issues
- **Degraded**: Cache > 90% full or low hit rate
- **Unhealthy**: Multiple critical issues

### Recommendations

Cache sistemi otomatik olarak şu durumlarda öneriler sunar:

- L1 cache %90+ dolu → L1 max size artırılmalı
- L2 cache %90+ dolu → L2 max size artırılmalı veya cleanup yapılmalı
- Hit rate < %50 → TTL ayarları gözden geçirilmeli
- Yüksek eviction rate → Cache size yetersiz

## 📝 Best Practices

1. **TTL Optimization**: Sık değişen veriler için kısa TTL, statik veriler için uzun TTL
2. **Cache Warming**: Kritik verileri uygulama başlangıcında cache'e yükle
3. **Pattern Organization**: Cache key'leri organize et (örn: `user:123:profile`)
4. **Monitor Health**: Düzenli olarak cache health endpoint'ini kontrol et
5. **L2 Cleanup**: Disk alanı için periyodik L2 cache temizliği yap

## 🔍 Troubleshooting

### Cache Hit Rate Düşük
- TTL ayarlarını kontrol et
- Cache warming stratejisini gözden geçir
- L1/L2 max size'ları artır

### Yüksek Memory Usage
- L1 max size'ı azalt
- TTL'leri kısalt
- Eviction policy'yi kontrol et

### L2 Cache Çalışmıyor
- L2 directory izinlerini kontrol et
- `enableL2` config'inin `true` olduğunu doğrula
- Disk alanını kontrol et

## 🎓 Öğrenilenler

- LRU cache algoritması ve doubly-linked list implementasyonu
- Multi-layer cache architecture ve trade-off'ları
- Cache eviction policies ve memory management
- File-based persistent caching
- Comprehensive monitoring ve health checks
- Cache warming strategies
- Pattern-based cache invalidation
