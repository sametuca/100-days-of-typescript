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
