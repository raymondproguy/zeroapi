/**
 * Router Class - Clean and focused
 */

import { Route, RouteMatch, RouteHandler, MiddlewareHandler } from '../types/core.js';

export class Router {
  private routes: Route[] = [];
  private globalMiddlewares: MiddlewareHandler[] = [];

  use(middleware: MiddlewareHandler): void {
    this.globalMiddlewares.push(middleware);
  }

  add(method: string, path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): void {
    const routeHandlers: RouteHandler[] = handlers.map(handler => {
      if (handler.length === 3) {
        return (req: any, res: any) => {
          return new Promise((resolve, reject) => {
            (handler as MiddlewareHandler)(req, res, (error?: any) => {
              if (error) reject(error);
              else resolve();
            });
          });
        };
      }
      return handler as RouteHandler;
    });

    this.routes.push({ method, path, handlers: routeHandlers });
  }

  find(method: string, urlPath: string): RouteMatch | null {
    for (const route of this.routes) {
      if (route.method === method && this.matchPath(route.path, urlPath)) {
        const params = this.extractParams(route.path, urlPath);
        return { ...route, params };
      }
    }
    return null;
  }

  private matchPath(routePath: string, urlPath: string): boolean {
    if (routePath.includes(':')) {
      const pattern = this.pathToRegex(routePath);
      return pattern.test(urlPath);
    }
    return routePath === urlPath;
  }

  private extractParams(routePath: string, urlPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (routePath.includes(':')) {
      const pattern = this.pathToRegex(routePath);
      const match = urlPath.match(pattern);
      
      if (match) {
        const paramNames = this.getParamNames(routePath);
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
      }
    }
    
    return params;
  }

  private pathToRegex(path: string): RegExp {
    const pattern = path.replace(/:\w+/g, '([^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  private getParamNames(path: string): string[] {
    return (path.match(/:\w+/g) || []).map(name => name.slice(1));
  }

  parseQuery(urlString: string): Record<string, string> {
    const query: Record<string, string> = {};
    try {
      const url = new URL(urlString, 'http://localhost');
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
    } catch {
      // Ignore URL parsing errors
    }
    return query;
  }

  getGlobalMiddlewares(): MiddlewareHandler[] {
    return this.globalMiddlewares;
  }
}
