/**
 * Day 56: Edge Computing & CDN Integration Demo
 * 
 * This demo showcases:
 * - Edge worker implementation
 * - Geographic routing
 * - Edge caching
 * - Content optimization
 * - Edge analytics
 */

import { EdgeWorker } from './edge/worker';
import { GeoRouter } from './edge/geo-router';
import { ContentOptimizer } from './edge/content-optimizer';

async function demonstrateEdgeWorker() {
  console.log('\n🌐 Edge Computing & CDN Integration Demo\n');
  console.log('='.repeat(50));

  // 1. Create edge worker
  console.log('\n1️⃣  Creating Edge Worker...');
  const worker = new EdgeWorker();

  // 2. Test health check
  console.log('\n2️⃣  Testing Health Check...');
  const healthRequest = new Request('https://example.com/api/health');
  const healthResponse = await worker.fetch(healthRequest);
  console.log('Health Check Response:', await healthResponse.json());

  // 3. Test geo information
  console.log('\n3️⃣  Testing Geographic Information...');
  const geoRequest = new Request('https://example.com/api/geo', {
    headers: {
      'CF-IPCountry': 'TR',
      'CF-Region': 'Istanbul',
      'CF-City': 'Istanbul'
    }
  });
  const geoResponse = await worker.fetch(geoRequest);
  console.log('Geo Information:', await geoResponse.json());

  // 4. Test cache stats
  console.log('\n4️⃣  Testing Cache Stats...');
  const statsRequest = new Request('https://example.com/api/cache/stats');
  const statsResponse = await worker.fetch(statsRequest);
  console.log('Cache Stats:', await statsResponse.json());

  // 5. Test metrics
  console.log('\n5️⃣  Testing Edge Metrics...');
  const metricsRequest = new Request('https://example.com/api/metrics');
  const metricsResponse = await worker.fetch(metricsRequest);
  console.log('Edge Metrics:', await metricsResponse.json());

  worker.shutdown();
}

async function demonstrateGeoRouting() {
  console.log('\n\n🌍 Geographic Routing Demo\n');
  console.log('='.repeat(50));

  const geoRouter = new GeoRouter();

  // Add routing rules
  geoRouter.addRule({
    countries: ['US', 'CA'],
    handler: async (_req) => ({
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      body: 'Routed to North America edge server'
    })
  });

  geoRouter.addRule({
    countries: ['GB', 'DE', 'FR'],
    handler: async (_req) => ({
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      body: 'Routed to Europe edge server'
    })
  });

  geoRouter.addRule({
    countries: ['TR'],
    handler: async (_req) => ({
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      body: 'Routed to Turkey edge server'
    })
  });

  // Test different geos
  const testCases = [
    { country: 'US', city: 'New York' },
    { country: 'GB', city: 'London' },
    { country: 'TR', city: 'Istanbul' },
    { country: 'JP', city: 'Tokyo' }
  ];

  for (const testCase of testCases) {
    const response = await geoRouter.route({
      method: 'GET',
      url: 'https://example.com',
      headers: new Headers(),
      geo: {
        country: testCase.country,
        region: '',
        city: testCase.city,
        latitude: 0,
        longitude: 0
      }
    });

    console.log(`\n${testCase.country} (${testCase.city}):`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Response: ${response.body}`);
  }
}

async function demonstrateContentOptimization() {
  console.log('\n\n⚡ Content Optimization Demo\n');
  console.log('='.repeat(50));

  const optimizer = new ContentOptimizer();

  // 1. HTML Minification
  console.log('\n1️⃣  HTML Minification:');
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page</title>
        <!-- This is a comment -->
      </head>
      <body>
        <h1>Hello World</h1>
        <p>This is a test page</p>
      </body>
    </html>
  `;
  const minifiedHTML = await optimizer.minifyHTML(html);
  console.log('Original size:', html.length, 'bytes');
  console.log('Minified size:', minifiedHTML.length, 'bytes');
  console.log('Savings:', ((1 - minifiedHTML.length / html.length) * 100).toFixed(2) + '%');

  // 2. CSS Minification
  console.log('\n2️⃣  CSS Minification:');
  const css = `
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    /* Header styles */
    .header {
      background-color: #333;
      color: white;
      padding: 20px;
    }
  `;
  const minifiedCSS = await optimizer.minifyCSS(css);
  console.log('Original size:', css.length, 'bytes');
  console.log('Minified size:', minifiedCSS.length, 'bytes');
  console.log('Savings:', ((1 - minifiedCSS.length / css.length) * 100).toFixed(2) + '%');

  // 3. JS Minification
  console.log('\n3️⃣  JavaScript Minification:');
  const js = `
    function calculateTotal(items) {
      // Calculate the total price
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += items[i].price;
      }
      return total;
    }
  `;
  const minifiedJS = await optimizer.minifyJS(js);
  console.log('Original size:', js.length, 'bytes');
  console.log('Minified size:', minifiedJS.length, 'bytes');
  console.log('Savings:', ((1 - minifiedJS.length / js.length) * 100).toFixed(2) + '%');

  // 4. Image format selection
  console.log('\n4️⃣  Image Format Selection:');
  const formats = [
    { accept: 'image/webp,image/png,*/*', original: 'png' },
    { accept: 'image/avif,image/webp,*/*', original: 'jpeg' },
    { accept: 'image/png,*/*', original: 'jpeg' }
  ];

  for (const format of formats) {
    const optimal = optimizer.getOptimalFormat(format.accept, format.original);
    console.log(`Accept: ${format.accept.split(',')[0]}`);
    console.log(`  Original: ${format.original} → Optimal: ${optimal}`);
  }
}

async function demonstrateCachingStrategies() {
  console.log('\n\n💾 Caching Strategies Demo\n');
  console.log('='.repeat(50));

  console.log('\n📋 Recommended Cache Strategies:\n');

  const strategies = [
    {
      type: 'Static Assets',
      pattern: '/assets/*',
      ttl: 31536000, // 1 year
      strategy: 'Cache-First',
      description: 'Long-term cache for versioned assets'
    },
    {
      type: 'API Responses',
      pattern: '/api/*',
      ttl: 300, // 5 minutes
      strategy: 'Stale-While-Revalidate',
      description: 'Fresh data with background updates'
    },
    {
      type: 'User Content',
      pattern: '/user/*',
      ttl: 3600, // 1 hour
      strategy: 'Network-First',
      description: 'Prefer fresh data, fallback to cache'
    },
    {
      type: 'Images',
      pattern: '/images/*',
      ttl: 86400, // 1 day
      strategy: 'Cache-First',
      description: 'Serve from cache, update periodically'
    }
  ];

  for (const strategy of strategies) {
    console.log(`${strategy.type}:`);
    console.log(`  Pattern: ${strategy.pattern}`);
    console.log(`  TTL: ${strategy.ttl}s (${humanizeDuration(strategy.ttl)})`);
    console.log(`  Strategy: ${strategy.strategy}`);
    console.log(`  Description: ${strategy.description}`);
    console.log();
  }
}

function humanizeDuration(seconds: number): string {
  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 }
  ];

  for (const unit of units) {
    if (seconds >= unit.seconds) {
      const value = Math.floor(seconds / unit.seconds);
      return `${value} ${unit.name}${value > 1 ? 's' : ''}`;
    }
  }

  return `${seconds} seconds`;
}

async function demonstratePerformanceMetrics() {
  console.log('\n\n📊 Performance Metrics Demo\n');
  console.log('='.repeat(50));

  console.log('\n⚡ Edge Performance Benefits:\n');

  const metrics = [
    {
      metric: 'Latency Reduction',
      traditional: '200ms',
      edge: '20ms',
      improvement: '90%'
    },
    {
      metric: 'Time to First Byte',
      traditional: '150ms',
      edge: '30ms',
      improvement: '80%'
    },
    {
      metric: 'Cache Hit Rate',
      traditional: '60%',
      edge: '85%',
      improvement: '+25%'
    },
    {
      metric: 'Bandwidth Savings',
      traditional: '100GB',
      edge: '30GB',
      improvement: '70%'
    }
  ];

  console.log('┌─────────────────────┬─────────────┬─────────┬─────────────┐');
  console.log('│ Metric              │ Traditional │ Edge    │ Improvement │');
  console.log('├─────────────────────┼─────────────┼─────────┼─────────────┤');
  
  for (const m of metrics) {
    console.log(
      `│ ${m.metric.padEnd(19)} │ ${m.traditional.padEnd(11)} │ ${m.edge.padEnd(7)} │ ${m.improvement.padEnd(11)} │`
    );
  }
  
  console.log('└─────────────────────┴─────────────┴─────────┴─────────────┘');
}

// Main execution
async function main() {
  try {
    await demonstrateEdgeWorker();
    await demonstrateGeoRouting();
    await demonstrateContentOptimization();
    await demonstrateCachingStrategies();
    await demonstratePerformanceMetrics();

    console.log('\n\n✅ Day 56 Demo Completed!\n');
    console.log('🌐 Edge Computing & CDN Integration successfully demonstrated!');
    console.log('\n' + '='.repeat(50));
  } catch (error) {
    console.error('Error running demo:', error);
    process.exit(1);
  }
}

// Run demo if executed directly
if (require.main === module) {
  main();
}

export { demonstrateEdgeWorker, demonstrateGeoRouting, demonstrateContentOptimization };
