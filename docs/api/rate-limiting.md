# Rate Limiting

DevTracker API implements rate limiting to ensure fair usage and maintain service quality for all users.

## Rate Limit Tiers

### 1. Unauthenticated Requests
- **Limit**: 100 requests per 15 minutes
- **Scope**: Per IP address
- **Use Case**: Public endpoints only

### 2. Authenticated Users (JWT)
- **Limit**: 1000 requests per 15 minutes
- **Scope**: Per user account
- **Use Case**: Standard API usage

### 3. API Keys
Rate limits vary by subscription plan:

| Plan | Requests/15min | Burst | Concurrent |
|------|----------------|-------|------------|
| Free | 1,000 | 100 | 10 |
| Starter | 5,000 | 500 | 25 |
| Professional | 20,000 | 2,000 | 100 |
| Enterprise | Custom | Custom | Custom |

## Rate Limit Headers

Every API response includes rate limit information in headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1701518400
X-RateLimit-Used: 13
```

### Header Descriptions

- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets
- `X-RateLimit-Used`: Requests consumed in current window

## Handling Rate Limits

### 1. Check Headers Before Making Requests

```typescript
async function apiCall(url: string) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
  const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
  
  if (remaining < 10) {
    console.warn(`Only ${remaining} requests remaining`);
    console.warn(`Resets at: ${new Date(reset * 1000)}`);
  }
  
  return response;
}
```

### 2. Implement Retry Logic

```typescript
async function apiCallWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url);
    
    if (response.status === 429) {
      const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
      const waitTime = (resetTime * 1000) - Date.now();
      
      if (i < maxRetries - 1) {
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
        continue;
      }
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

### 3. Use Exponential Backoff

```typescript
async function apiCallWithBackoff(url: string) {
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    const response = await fetch(url);
    
    if (response.status !== 429) {
      return response;
    }
    
    const backoffTime = Math.min(1000 * Math.pow(2, retries), 30000);
    console.log(`Backing off for ${backoffTime}ms`);
    await new Promise(resolve => setTimeout(resolve, backoffTime));
    retries++;
  }
  
  throw new Error('Rate limit exceeded after retries');
}
```

## Rate Limit Response

When you exceed the rate limit, you'll receive a 429 response:

```json
{
  "status": "error",
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 847
}
```

### Response Fields

- `retryAfter`: Seconds until rate limit resets
- Can also check `Retry-After` header

## Best Practices

### 1. Cache Responses

Cache API responses to reduce request count:

```typescript
const cache = new Map();

async function getCachedData(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < 60000) { // 1 minute cache
      return data;
    }
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Batch Requests

Use batch endpoints when available:

```typescript
// ❌ Multiple individual requests
for (const id of taskIds) {
  await fetch(`/api/tasks/${id}`);
}

// ✅ Single batch request
await fetch('/api/tasks/batch', {
  method: 'POST',
  body: JSON.stringify({ ids: taskIds })
});
```

### 3. Use Webhooks Instead of Polling

```typescript
// ❌ Polling every 5 seconds
setInterval(async () => {
  const tasks = await fetch('/api/tasks');
  // Process tasks
}, 5000);

// ✅ Use webhooks
// Configure webhook at /api/webhooks
// Receive updates at your endpoint
```

### 4. Implement Request Queuing

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private rateLimit = 10; // requests per second
  
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const interval = 1000 / this.rateLimit;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    this.processing = false;
  }
}

const queue = new RequestQueue();
queue.add(() => fetch('/api/tasks/1'));
queue.add(() => fetch('/api/tasks/2'));
```

## Monitoring Usage

### Check Current Usage

```bash
GET /api/usage/rate-limits
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "limit": 1000,
    "remaining": 850,
    "reset": 1701518400,
    "used": 150,
    "percentage": 15.0
  }
}
```

### Usage Analytics

```bash
GET /api/usage/analytics?period=24h
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "period": "24h",
    "totalRequests": 15420,
    "byEndpoint": {
      "/api/tasks": 8500,
      "/api/projects": 3200,
      "/api/users": 2100
    },
    "byHour": [...],
    "rateLimitHits": 3
  }
}
```

## Increasing Rate Limits

### 1. Upgrade Plan

Visit [devtracker.com/pricing](https://devtracker.com/pricing) to upgrade to a higher tier.

### 2. Request Custom Limits

For enterprise needs:
- Email: enterprise@devtracker.com
- Include: Use case, expected volume, timeline

### 3. Optimize Usage

Before requesting increases:
- Implement caching
- Use batch endpoints
- Switch to webhooks
- Review query efficiency

## Rate Limit Bypass (Testing)

For development and testing, use the test API key:

```bash
X-API-Key: dt_test_unlimited
```

**Note:** Test keys:
- Only work in development/staging
- Have no rate limits
- Reset data daily

## Support

If you're experiencing rate limit issues:

1. Review your usage patterns
2. Check [Status Page](https://status.devtracker.com)
3. Contact support@devtracker.com with:
   - Your API key or user ID
   - Timestamp of issues
   - Example requests
   - Current plan tier
