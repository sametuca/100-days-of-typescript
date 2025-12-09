import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';

const tracer = trace.getTracer('task-service');

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const span = tracer.startSpan(`${req.method} ${req.path}`, {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'http.host': req.hostname,
      'http.user_agent': req.get('user-agent') || 'unknown',
    },
  });

  // Attach span to request context
  const ctx = trace.setSpan(context.active(), span);

  // Run the rest of the middleware chain in this context
  context.with(ctx, () => {
    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode,
      });

      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`,
        });
      }

      span.end();
    });

    next();
  });
}

/**
 * Create custom span for tracking specific operations
 */
export async function createSpan<T>(name: string, callback: () => Promise<T>): Promise<T> {
  const span = tracer.startSpan(name);
  
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await callback();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
