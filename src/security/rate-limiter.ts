interface RequestLog {
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

export class RateLimiter {
  private requests: Map<string, RequestLog[]> = new Map();

  async checkLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests
    let requests = this.requests.get(key) || [];

    // Remove old requests
    requests = requests.filter(req => req.timestamp > windowStart);

    // Check limit
    if (requests.length >= limit) {
      const oldestRequest = requests[0];
      const resetTime = oldestRequest.timestamp + windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetAt: resetTime,
        retryAfter: resetTime - now
      };
    }

    // Add new request
    requests.push({ timestamp: now });
    this.requests.set(key, requests);

    return {
      allowed: true,
      remaining: limit - requests.length,
      resetAt: now + windowMs,
      retryAfter: 0
    };
  }

  middleware(limit: number = 100, windowMs: number = 60000) {
    return async (req: any, res: any, next: any) => {
      const key = req.ip || req.connection.remoteAddress;
      const result = await this.checkLimit(key, limit, windowMs);

      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetAt.toString());

      if (!result.allowed) {
        res.setHeader('Retry-After', Math.ceil(result.retryAfter / 1000).toString());
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: result.retryAfter
        });
      }

      next();
    };
  }

  clear(): void {
    this.requests.clear();
  }
}
