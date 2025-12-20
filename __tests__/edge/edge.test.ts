import { EdgeWorker } from '../../src/edge/worker';
import { EdgeRouter } from '../../src/edge/router';
import { EdgeCacheManager } from '../../src/edge/cache-manager';
import { GeoRouter } from '../../src/edge/geo-router';

describe('Edge Computing', () => {
  describe('EdgeWorker', () => {
    let worker: EdgeWorker;

    beforeEach(() => {
      worker = new EdgeWorker();
    });

    afterEach(() => {
      worker.shutdown();
    });

    it('should handle health check', async () => {
      const request = new Request('https://example.com/api/health');
      const response = await worker.fetch(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.edge).toBe(true);
      expect(data.timestamp).toBeDefined();
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
      expect(data.geo.region).toBe('California');
      expect(data.geo.city).toBe('San Francisco');
    });

    it('should return metrics', async () => {
      const request = new Request('https://example.com/api/metrics');
      const response = await worker.fetch(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('totalRequests');
      expect(data).toHaveProperty('avgDuration');
      expect(data).toHaveProperty('statusCodes');
      expect(data).toHaveProperty('topPaths');
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

    it('should handle 404 for unknown routes', async () => {
      const request = new Request('https://example.com/api/unknown');
      const response = await worker.fetch(request, {});

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found');
    });
  });

  describe('EdgeRouter', () => {
    let router: EdgeRouter;

    beforeEach(() => {
      router = new EdgeRouter();
    });

    it('should route GET requests', async () => {
      router.get('/test', async (req) => ({
        status: 200,
        headers: new Headers(),
        body: 'test response'
      }));

      const response = await router.handle(
        {
          method: 'GET',
          url: 'https://example.com/test',
          headers: new Headers()
        },
        {}
      );

      expect(response.status).toBe(200);
      expect(response.body).toBe('test response');
    });

    it('should route POST requests', async () => {
      router.post('/data', async (req) => ({
        status: 201,
        headers: new Headers(),
        body: JSON.stringify({ created: true })
      }));

      const response = await router.handle(
        {
          method: 'POST',
          url: 'https://example.com/data',
          headers: new Headers()
        },
        {}
      );

      expect(response.status).toBe(201);
    });

    it('should apply middleware', async () => {
      let middlewareExecuted = false;

      router.use(async (req) => {
        middlewareExecuted = true;
        return null as any;
      });

      router.get('/test', async (req) => ({
        status: 200,
        headers: new Headers(),
        body: 'test'
      }));

      await router.handle(
        {
          method: 'GET',
          url: 'https://example.com/test',
          headers: new Headers()
        },
        {}
      );

      expect(middlewareExecuted).toBe(true);
    });
  });

  describe('EdgeCacheManager', () => {
    let cache: EdgeCacheManager;

    beforeEach(() => {
      cache = new EdgeCacheManager();
    });

    it('should cache and retrieve responses', async () => {
      const response = new Response('test data', { status: 200 });
      await cache.set('test-key', response, { ttl: 60 });

      const cached = await cache.get('test-key');
      expect(cached).not.toBeNull();
      expect(await cached!.text()).toBe('test data');
    });

    it('should expire cached items', async () => {
      const response = new Response('test data', { status: 200 });
      await cache.set('test-key', response, { ttl: -1 }); // Already expired

      const cached = await cache.get('test-key');
      expect(cached).toBeNull();
    });

    it('should purge by tag', async () => {
      const response1 = new Response('data1', { status: 200 });
      const response2 = new Response('data2', { status: 200 });

      await cache.set('key1', response1, { tags: ['users'] });
      await cache.set('key2', response2, { tags: ['posts'] });

      await cache.purgeByTag('users');

      const cached1 = await cache.get('key1');
      const cached2 = await cache.get('key2');

      expect(cached1).toBeNull();
      expect(cached2).not.toBeNull();
    });

    it('should purge all cache', async () => {
      const response = new Response('test', { status: 200 });
      await cache.set('key1', response);
      await cache.set('key2', response);

      await cache.purgeAll();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('GeoRouter', () => {
    let geoRouter: GeoRouter;

    beforeEach(() => {
      geoRouter = new GeoRouter();
    });

    it('should route by country', async () => {
      let routed = false;

      geoRouter.addRule({
        countries: ['US', 'CA'],
        handler: async (req) => {
          routed = true;
          return {
            status: 200,
            headers: new Headers(),
            body: 'US/CA handler'
          };
        }
      });

      const response = await geoRouter.route({
        method: 'GET',
        url: 'https://example.com',
        headers: new Headers(),
        geo: {
          country: 'US',
          region: 'California',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194
        }
      });

      expect(routed).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should use default handler for unmatched geo', async () => {
      geoRouter.setDefault(async (req) => ({
        status: 200,
        headers: new Headers(),
        body: 'default handler'
      }));

      const response = await geoRouter.route({
        method: 'GET',
        url: 'https://example.com',
        headers: new Headers(),
        geo: {
          country: 'JP',
          region: 'Tokyo',
          city: 'Tokyo',
          latitude: 35.6762,
          longitude: 139.6503
        }
      });

      expect(response.status).toBe(200);
      expect(response.body).toBe('default handler');
    });

    it('should return 503 without default handler', async () => {
      const response = await geoRouter.route({
        method: 'GET',
        url: 'https://example.com',
        headers: new Headers()
      });

      expect(response.status).toBe(503);
    });
  });
});
