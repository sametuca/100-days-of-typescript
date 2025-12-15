import { LambdaEvent, LambdaContext, LambdaResponse, LambdaHandler, MiddlewareFunction } from './types';
import logger from '../utils/logger';

/**
 * Compose multiple handlers into a pipeline
 */
export function compose(...handlers: LambdaHandler[]): LambdaHandler {
  return async (event: LambdaEvent, context: LambdaContext): Promise<LambdaResponse> => {
    let currentEvent = event;
    let lastResponse: LambdaResponse = {
      statusCode: 200,
      body: ''
    };

    for (const handler of handlers) {
      // Check remaining time
      if (context.getRemainingTimeInMillis() < 1000) {
        return {
          statusCode: 504,
          body: JSON.stringify({ error: 'Function timeout approaching' })
        };
      }

      lastResponse = await handler(currentEvent, context);

      // Break on error
      if (lastResponse.statusCode >= 400) {
        break;
      }

      // Pass response body as next event body
      currentEvent = {
        ...currentEvent,
        body: lastResponse.body
      };
    }

    return lastResponse;
  };
}

/**
 * Apply middleware to a handler
 */
export function withMiddleware(
  handler: LambdaHandler,
  ...middlewares: MiddlewareFunction[]
): LambdaHandler {
  return async (event: LambdaEvent, context: LambdaContext): Promise<LambdaResponse> => {
    let index = 0;

    const next = async (): Promise<LambdaResponse> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return middleware(event, context, next);
      }
      return handler(event, context);
    };

    return next();
  };
}

// Built-in middlewares
export const loggingMiddleware: MiddlewareFunction = async (event, context, next) => {
  const start = Date.now();
  logger.info(`Function start: ${context.functionName}`, {
    requestId: context.awsRequestId,
    method: event.httpMethod,
    path: event.path
  });

  const response = await next();

  logger.info(`Function end: ${context.functionName}`, {
    requestId: context.awsRequestId,
    duration: Date.now() - start,
    statusCode: response.statusCode
  });

  return response;
};

export const errorHandlerMiddleware: MiddlewareFunction = async (event, context, next) => {
  try {
    return await next();
  } catch (error: any) {
    logger.error(`Unhandled error in ${context.functionName}:`, error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        requestId: context.awsRequestId
      })
    };
  }
};

export const corsMiddleware: MiddlewareFunction = async (event, context, next) => {
  const response = await next();

  return {
    ...response,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
  };
};

export const jsonParserMiddleware: MiddlewareFunction = async (event, context, next) => {
  if (event.body && typeof event.body === 'string') {
    try {
      (event as any).parsedBody = JSON.parse(event.body);
    } catch {
      // Keep original body if not JSON
    }
  }
  return next();
};

export const authMiddleware = (validateToken: (token: string) => Promise<boolean>): MiddlewareFunction => {
  return async (event, context, next) => {
    const authHeader = event.headers?.['authorization'] || event.headers?.['Authorization'];
    
    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing authorization header' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const isValid = await validateToken(token);

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    return next();
  };
};

export const rateLimitMiddleware = (
  maxRequests: number,
  windowMs: number
): MiddlewareFunction => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (event, context, next) => {
    const ip = event.requestContext?.identity?.sourceIp || 'unknown';
    const now = Date.now();
    
    let record = requests.get(ip);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      requests.set(ip, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      return {
        statusCode: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
        },
        body: JSON.stringify({ error: 'Too many requests' })
      };
    }

    return next();
  };
};
