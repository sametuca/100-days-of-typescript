import { EdgeRouter } from './router';
import { EdgeCacheManager } from './cache-manager';
import { EdgeAnalytics } from './analytics';
import { EdgeRequest, EdgeContext } from './types';

export class EdgeWorker {
  private router: EdgeRouter;
  private cache: EdgeCacheManager;
  private analytics: EdgeAnalytics;

  constructor() {
    this.router = new EdgeRouter();
    this.cache = new EdgeCacheManager();
    this.analytics = new EdgeAnalytics();

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Cache middleware
    this.router.use(async (request, _context) => {
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

    // Health check endpoint
    this.router.get('/api/health', async (_request, _context) => {
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

    // Geo information endpoint
    this.router.get('/api/geo', async (request, _context) => {
      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ geo: request.geo })
      };
    });

    // Metrics endpoint
    this.router.get('/api/metrics', async (_request, _context) => {
      const metrics = this.analytics.getMetrics();
      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(metrics)
      };
    });

    // Cache stats endpoint
    this.router.get('/api/cache/stats', async (_request, _context) => {
      const stats = this.cache.getStats();
      return {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(stats)
      };
    });

    // Cache purge endpoint
    this.router.post('/api/cache/purge', async (request, _context) => {
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

  async fetch(request: Request, env: any = {}): Promise<Response> {
    const startTime = Date.now();

    try {
      const edgeRequest = await this.convertRequest(request);
      const context: EdgeContext = {
        waitUntil: (promise) => {
          // In Cloudflare Workers, this extends the lifetime
          promise.catch(err => console.error('Background task failed:', err));
        },
        passThroughOnException: () => {
          // Pass through to origin on exception
        },
        request: edgeRequest,
        env
      };

      const response = await this.router.handle(edgeRequest, context);
      
      // Convert to standard Response
      return new Response(response.body as any, {
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

  shutdown(): void {
    this.analytics.stopAutoFlush();
  }
}

// Export for Cloudflare Workers
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const worker = new EdgeWorker();
    return worker.fetch(request, env);
  }
};
