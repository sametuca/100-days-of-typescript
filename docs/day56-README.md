# Day 56: Edge Computing & CDN Integration 🌐⚡

## 🎯 Günün Hedefleri

✅ Edge computing infrastructure  
✅ CDN integration & cache control  
✅ Edge function implementation  
✅ Geographic routing & distribution  
✅ Edge caching strategies  
✅ Content optimization & compression  
✅ Real-time edge analytics  

## 📚 Teorik Bilgiler

### Edge Computing Nedir?

**Edge Computing**, verilerin merkezi bir veri merkezinde işlenmesi yerine, veri kaynağına yakın konumlarda (edge locations) işlenmesini sağlayan bir mimaridir.

**Avantajları:**
- Düşük gecikme süresi (latency)
- Bant genişliği tasarrufu
- Daha iyi kullanıcı deneyimi
- Coğrafi optimizasyon
- Yüksek ölçeklenebilirlik

### CDN (Content Delivery Network)

CDN, içeriği coğrafi olarak dağıtılmış sunucularda önbelleğe alarak kullanıcılara en yakın sunucudan hizmet verir.

## 🚀 Eklenen Özellikler

### 1. Edge Function Framework

```typescript
// src/edge/types.ts
export interface EdgeRequest {
  method: string;
  url: string;
  headers: Headers;
  body?: ReadableStream | null;
  geo?: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  cf?: {
    colo: string; // Data center code
    asn: number;
    tlsVersion: string;
  };
}

export interface EdgeResponse {
  status: number;
  statusText?: string;
  headers: Headers;
  body?: BodyInit;
}

export interface EdgeContext {
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  request: EdgeRequest;
  env: Record<string, any>;
}

export type EdgeHandler = (
  request: EdgeRequest,
  context: EdgeContext
) => Promise<EdgeResponse> | EdgeResponse;
```

### 2. Edge Router

```typescript
// src/edge/router.ts
import { EdgeRequest, EdgeResponse, EdgeHandler } from './types';

export class EdgeRouter {
  private routes: Map<string, Map<string, EdgeHandler>> = new Map();
  private middleware: EdgeHandler[] = [];

  use(handler: EdgeHandler): void {
    this.middleware.push(handler);
  }

  get(path: string, handler: EdgeHandler): void {
    this.addRoute('GET', path, handler);
  }

  post(path: string, handler: EdgeHandler): void {
    this.addRoute('POST', path, handler);
  }

  put(path: string, handler: EdgeHandler): void {
    this.addRoute('PUT', path, handler);
  }

  delete(path: string, handler: EdgeHandler): void {
    this.addRoute('DELETE', path, handler);
  }

  private addRoute(method: string, path: string, handler: EdgeHandler): void {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }
    this.routes.get(method)!.set(path, handler);
  }

  async handle(request: EdgeRequest, context: any): Promise<EdgeResponse> {
    // Apply middleware
    for (const middleware of this.middleware) {
      const response = await middleware(request, context);
      if (response) {
        return response;
      }
    }

    // Match route
    const url = new URL(request.url);
    const methodRoutes = this.routes.get(request.method);
    
    if (!methodRoutes) {
      return this.notFound();
    }

    // Try exact match first
    const handler = methodRoutes.get(url.pathname);
    if (handler) {
      return await handler(request, context);
    }

    // Try pattern matching
    for (const [pattern, handler] of methodRoutes) {
      if (this.matchPattern(pattern, url.pathname)) {
        return await handler(request, context);
      }
    }

    return this.notFound();
  }

  private matchPattern(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return false;
    }

    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === pathParts[i];
    });
  }

  private notFound(): EdgeResponse {
    return {
      status: 404,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Not Found' })
    };
  }
}
```

### 3. CDN Cache Manager

```typescript
// src/edge/cache-manager.ts
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  revalidate?: boolean;
  staleWhileRevalidate?: number;
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
}

interface CacheEntry {
  response: Response;
  createdAt: number;
  expiresAt?: number;
  staleAt?: number;
  tags: string[];
  needsRevalidation: boolean;
}
```

### 4. Geographic Router

```typescript
// src/edge/geo-router.ts
import { EdgeRequest, EdgeResponse } from './types';

export interface GeoRule {
  countries?: string[];
  regions?: string[];
  continents?: string[];
  handler: (request: EdgeRequest) => Promise<EdgeResponse>;
}

export class GeoRouter {
  private rules: GeoRule[] = [];
  private defaultHandler?: (request: EdgeRequest) => Promise<EdgeResponse>;

  addRule(rule: GeoRule): void {
    this.rules.push(rule);
  }

  setDefault(handler: (request: EdgeRequest) => Promise<EdgeResponse>): void {
    this.defaultHandler = handler;
  }

  async route(request: EdgeRequest): Promise<EdgeResponse> {
    if (!request.geo) {
      return this.routeToDefault(request);
    }

    // Find matching rule
    for (const rule of this.rules) {
      if (this.matchesRule(request, rule)) {
        return await rule.handler(request);
      }
    }

    return this.routeToDefault(request);
  }

  private matchesRule(request: EdgeRequest, rule: GeoRule): boolean {
    if (!request.geo) return false;

    if (rule.countries?.includes(request.geo.country)) {
      return true;
    }

    if (rule.regions?.includes(request.geo.region)) {
      return true;
    }

    if (rule.continents) {
      const continent = this.getContinent(request.geo.country);
      if (rule.continents.includes(continent)) {
        return true;
      }
    }

    return false;
  }

  private getContinent(country: string): string {
    // Simplified continent mapping
    const continentMap: Record<string, string> = {
      US: 'NA',
      CA: 'NA',
      MX: 'NA',
      BR: 'SA',
      AR: 'SA',
      GB: 'EU',
      DE: 'EU',
      FR: 'EU',
      TR: 'EU',
      RU: 'EU',
      CN: 'AS',
      JP: 'AS',
      IN: 'AS',
      AU: 'OC',
      NZ: 'OC',
      ZA: 'AF',
      EG: 'AF'
    };
    return continentMap[country] || 'Unknown';
  }

  private async routeToDefault(request: EdgeRequest): Promise<EdgeResponse> {
    if (this.defaultHandler) {
      return await this.defaultHandler(request);
    }

    return {
      status: 503,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Service Unavailable' })
    };
  }
}
```

### 5. Content Optimizer

```typescript
// src/edge/content-optimizer.ts
export class ContentOptimizer {
  async optimizeImage(
    buffer: ArrayBuffer,
    options: ImageOptions = {}
  ): Promise<ArrayBuffer> {
    // Image optimization logic
    // In production, use sharp or similar library
    return buffer;
  }

  async compressText(content: string, encoding: string = 'gzip'): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // In a real implementation, use compression library
    return data.buffer;
  }

  async minifyHTML(html: string): Promise<string> {
    return html
      .replace(/\s+/g, ' ')
      .replace(/<!--.*?-->/g, '')
      .trim();
  }

  async minifyCSS(css: string): Promise<string> {
    return css
      .replace(/\s+/g, ' ')
      .replace(/\/\*.*?\*\//g, '')
      .trim();
  }

  async minifyJS(js: string): Promise<string> {
    return js
      .replace(/\s+/g, ' ')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*.*?\*\//g, '')
      .trim();
  }

  getOptimalFormat(accept: string, originalFormat: string): string {
    if (accept.includes('image/webp')) {
      return 'webp';
    }
    if (accept.includes('image/avif')) {
      return 'avif';
    }
    return originalFormat;
  }
}

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}
```

### 6. Edge Analytics

```typescript
// src/edge/analytics.ts
export class EdgeAnalytics {
  private events: AnalyticsEvent[] = [];
  private batchSize = 100;
  private flushInterval = 10000; // 10 seconds

  constructor() {
    this.startAutoFlush();
  }

  track(event: Partial<AnalyticsEvent>): void {
    this.events.push({
      timestamp: Date.now(),
      type: event.type || 'pageview',
      path: event.path || '',
      method: event.method || 'GET',
      status: event.status || 200,
      duration: event.duration || 0,
      geo: event.geo,
      userAgent: event.userAgent,
      referer: event.referer
    });

    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    try {
      // Send to analytics service
      await this.send(batch);
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-add events on failure
      this.events.push(...batch);
    }
  }

  private async send(events: AnalyticsEvent[]): Promise<void> {
    // In production, send to analytics service
    console.log(`Sending ${events.length} analytics events`);
  }

  private startAutoFlush(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  getMetrics(): EdgeMetrics {
    const now = Date.now();
    const recentEvents = this.events.filter(
      e => now - e.timestamp < 60000 // Last minute
    );

    const totalRequests = recentEvents.length;
    const avgDuration = recentEvents.reduce((sum, e) => sum + e.duration, 0) / totalRequests || 0;
    
    const statusCodes = recentEvents.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topPaths = this.getTopN(
      recentEvents.map(e => e.path),
      5
    );

    return {
      totalRequests,
      avgDuration,
      statusCodes,
      topPaths
    };
  }

  private getTopN(items: string[], n: number): Array<{ item: string; count: number }> {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }
}

interface AnalyticsEvent {
  timestamp: number;
  type: string;
  path: string;
  method: string;
  status: number;
  duration: number;
  geo?: {
    country: string;
    city: string;
  };
  userAgent?: string;
  referer?: string;
}

interface EdgeMetrics {
  totalRequests: number;
  avgDuration: number;
  statusCodes: Record<number, number>;
  topPaths: Array<{ item: string; count: number }>;
}
```

### 7. Edge Worker Implementation

```typescript
// src/edge/worker.ts
import { EdgeRouter } from './router';
import { EdgeCacheManager } from './cache-manager';
import { GeoRouter } from './geo-router';
import { ContentOptimizer } from './content-optimizer';
import { EdgeAnalytics } from './analytics';
import { EdgeRequest, EdgeResponse, EdgeContext } from './types';

export class EdgeWorker {
  private router: EdgeRouter;
  private cache: EdgeCacheManager;
  private geoRouter: GeoRouter;
  private optimizer: ContentOptimizer;
  private analytics: EdgeAnalytics;

  constructor() {
    this.router = new EdgeRouter();
    this.cache = new EdgeCacheManager();
    this.geoRouter = new GeoRouter();
    this.optimizer = new ContentOptimizer();
    this.analytics = new EdgeAnalytics();

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Cache middleware
    this.router.use(async (request, context) => {
      const cacheKey = this.cache.getCacheKey(request as any);
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return {
          status: cached.status,
          headers: cached.headers,
          body: await cached.text()
        };
      }
      
      return null as any;
    });

    // Analytics middleware
    this.router.use(async (request, context) => {
      const startTime = Date.now();
      
      // Continue to next handler
      context.waitUntil(
        Promise.resolve().then(() => {
          const duration = Date.now() - startTime;
          this.analytics.track({
            path: new URL(request.url).pathname,
            method: request.method,
            duration,
            geo: request.geo
          });
        })
      );
      
      return null as any;
    });

    // API routes
    this.router.get('/api/health', async (request, context) => {
      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ 
          status: 'healthy',
          edge: true,
          timestamp: Date.now()
        })
      };
    });

    this.router.get('/api/geo', async (request, context) => {
      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ geo: request.geo })
      };
    });

    this.router.get('/api/metrics', async (request, context) => {
      const metrics = this.analytics.getMetrics();
      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(metrics)
      };
    });

    // Cache purge
    this.router.post('/api/cache/purge', async (request, context) => {
      const body = request.body ? await this.readBody(request.body) : null;
      const data = body ? JSON.parse(body) : {};

      if (data.tag) {
        await this.cache.purgeByTag(data.tag);
      } else if (data.key) {
        await this.cache.purge(data.key);
      } else {
        await this.cache.purgeAll();
      }

      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ success: true })
      };
    });
  }

  async fetch(request: Request, env: any): Promise<Response> {
    const startTime = Date.now();

    try {
      const edgeRequest = await this.convertRequest(request);
      const context: EdgeContext = {
        waitUntil: (promise) => {
          // In Cloudflare Workers, this extends the lifetime
        },
        passThroughOnException: () => {
          // Pass through to origin on exception
        },
        request: edgeRequest,
        env
      };

      const response = await this.router.handle(edgeRequest, context);
      
      // Convert to standard Response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      console.error('Edge worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } finally {
      const duration = Date.now() - startTime;
      console.log(`Request processed in ${duration}ms`);
    }
  }

  private async convertRequest(request: Request): Promise<EdgeRequest> {
    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      geo: this.extractGeo(request),
      cf: this.extractCloudflare(request)
    };
  }

  private extractGeo(request: Request): any {
    // Extract from Cloudflare headers or similar
    return {
      country: request.headers.get('CF-IPCountry') || 'Unknown',
      region: request.headers.get('CF-Region') || 'Unknown',
      city: request.headers.get('CF-City') || 'Unknown',
      latitude: 0,
      longitude: 0
    };
  }

  private extractCloudflare(request: Request): any {
    return {
      colo: request.headers.get('CF-RAY')?.split('-')[1] || 'Unknown',
      asn: 0,
      tlsVersion: 'TLS 1.3'
    };
  }

  private async readBody(body: ReadableStream): Promise<string> {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return new TextDecoder().decode(result);
  }
}

// Export for Cloudflare Workers
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const worker = new EdgeWorker();
    return worker.fetch(request, env);
  }
};
```

### 8. Edge Configuration

```typescript
// src/edge/config.ts
export interface EdgeConfig {
  cache: {
    defaultTTL: number;
    maxTTL: number;
    staleWhileRevalidate: number;
  };
  geo: {
    enableRouting: boolean;
    defaultRegion: string;
  };
  optimization: {
    minifyHTML: boolean;
    minifyCSS: boolean;
    minifyJS: boolean;
    optimizeImages: boolean;
  };
  analytics: {
    enabled: boolean;
    sampleRate: number;
  };
  security: {
    rateLimitPerMinute: number;
    allowedOrigins: string[];
  };
}

export const defaultEdgeConfig: EdgeConfig = {
  cache: {
    defaultTTL: 3600,
    maxTTL: 86400,
    staleWhileRevalidate: 300
  },
  geo: {
    enableRouting: true,
    defaultRegion: 'us-east-1'
  },
  optimization: {
    minifyHTML: true,
    minifyCSS: true,
    minifyJS: true,
    optimizeImages: true
  },
  analytics: {
    enabled: true,
    sampleRate: 1.0
  },
  security: {
    rateLimitPerMinute: 100,
    allowedOrigins: ['*']
  }
};
```

## 🧪 Test Senaryoları

```typescript
// __tests__/edge/edge-worker.test.ts
import { EdgeWorker } from '../../src/edge/worker';

describe('EdgeWorker', () => {
  let worker: EdgeWorker;

  beforeEach(() => {
    worker = new EdgeWorker();
  });

  describe('fetch', () => {
    it('should handle health check', async () => {
      const request = new Request('https://example.com/api/health');
      const response = await worker.fetch(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.edge).toBe(true);
    });

    it('should return geo information', async () => {
      const request = new Request('https://example.com/api/geo', {
        headers: {
          'CF-IPCountry': 'US',
          'CF-Region': 'California',
          'CF-City': 'San Francisco'
        }
      });
      const response = await worker.fetch(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.geo.country).toBe('US');
    });

    it('should handle cache purge', async () => {
      const request = new Request('https://example.com/api/cache/purge', {
        method: 'POST',
        body: JSON.stringify({ tag: 'users' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const response = await worker.fetch(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
```

## 📊 Performans Optimizasyonları

### 1. Cache Stratejileri

- **Static Assets**: 1 yıl TTL
- **API Responses**: 5 dakika TTL
- **User Content**: 1 saat TTL
- **Stale-While-Revalidate**: Eski içeriği göster, arka planda güncelle

### 2. Geographic Optimization

```typescript
// US users → us-east-1 edge
// EU users → eu-west-1 edge
// ASIA users → ap-southeast-1 edge
```

### 3. Content Optimization

- Image optimization (WebP/AVIF)
- HTML/CSS/JS minification
- Gzip/Brotli compression
- Lazy loading

## 🎯 Kullanım Örnekleri

### Cloudflare Workers Deployment

```typescript
// wrangler.toml
name = "typescript-edge-worker"
main = "src/edge/worker.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }
```

### Deploy Script

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

## 📈 Monitoring & Analytics

### Edge Metrics

```typescript
{
  "totalRequests": 10000,
  "avgDuration": 45,
  "cacheHitRate": 0.85,
  "topLocations": [
    { "country": "US", "requests": 4500 },
    { "country": "GB", "requests": 2300 },
    { "country": "DE", "requests": 1800 }
  ],
  "statusCodes": {
    "200": 9500,
    "404": 300,
    "500": 200
  }
}
```

## 🎓 Öğrenilenler

1. ✅ Edge computing architecture
2. ✅ CDN integration & caching
3. ✅ Geographic routing
4. ✅ Content optimization
5. ✅ Real-time edge analytics
6. ✅ Cloudflare Workers deployment
7. ✅ Performance optimization techniques

## 🚀 Sonraki Adımlar

- Day 57: WebAssembly Integration
- Day 58: Advanced Security & OAuth2
- Day 59: Multi-Region Database Sync
- Day 60: Event Sourcing & CQRS

## 📚 Kaynaklar

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Edge Computing Best Practices](https://www.cloudflare.com/learning/serverless/glossary/what-is-edge-computing/)
- [CDN Caching Strategies](https://www.cloudflare.com/learning/cdn/what-is-caching/)
- [WebAssembly on the Edge](https://webassembly.org/)

---

**Day 56 tamamlandı!** 🌐⚡ Edge computing ve CDN entegrasyonu ile düşük gecikme süreli, yüksek performanslı bir uygulama geliştirdik.
