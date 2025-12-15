import { Request, Response, Router } from 'express';
import { ServerlessRuntime } from '../runtime';
import { LambdaEvent } from '../types';
import logger from '../../utils/logger';

export class HttpAdapter {
  private runtime: ServerlessRuntime;
  private router: Router;

  constructor(runtime: ServerlessRuntime) {
    this.runtime = runtime;
    this.router = Router();
  }

  /**
   * Create Express route for a function
   */
  createRoute(
    functionName: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string
  ): void {
    const handler = async (req: Request, res: Response) => {
      const event = this.transformRequest(req);
      
      try {
        const result = await this.runtime.invoke(functionName, event);
        
        // Set response headers
        if (result.headers) {
          Object.entries(result.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        }

        // Parse and send body
        let body: any;
        try {
          body = JSON.parse(result.body);
        } catch {
          body = result.body;
        }

        res.status(result.statusCode).json(body);
      } catch (error: any) {
        logger.error('HTTP adapter error:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message
        });
      }
    };

    switch (method) {
      case 'GET':
        this.router.get(path, handler);
        break;
      case 'POST':
        this.router.post(path, handler);
        break;
      case 'PUT':
        this.router.put(path, handler);
        break;
      case 'DELETE':
        this.router.delete(path, handler);
        break;
      case 'PATCH':
        this.router.patch(path, handler);
        break;
    }

    logger.info(`Route registered: ${method} ${path} -> ${functionName}`);
  }

  /**
   * Transform Express request to Lambda event
   */
  private transformRequest(req: Request): LambdaEvent {
    return {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers as Record<string, string>,
      queryStringParameters: req.query as Record<string, string>,
      pathParameters: req.params,
      body: req.body ? JSON.stringify(req.body) : null,
      isBase64Encoded: false,
      requestContext: {
        requestId: req.headers['x-request-id'] as string || '',
        stage: process.env.STAGE || 'dev',
        identity: {
          sourceIp: req.ip || '',
          userAgent: req.get('user-agent') || ''
        }
      }
    };
  }

  getRouter(): Router {
    return this.router;
  }
}
