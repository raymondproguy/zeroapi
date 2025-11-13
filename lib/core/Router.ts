import { URL } from 'url';
import { Route, RouteMatch, RouteHandler, MiddlewareHandler } from './types.js';

export class Router {
  private routes: Route[] = [];
  private globalMiddlewares: MiddlewareHandler[] = [];

  use(middleware: MiddlewareHandler): void {
    this.globalMiddlewares.push(middleware);
  }

  add(method: string, path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): void {
    const routeHandlers: RouteHandler[] = handlers.map(handler => {
      if (handler.length === 3) {
        return (req: any, res: any, next?: any) => {
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

  private pathToRegex(path: string): RegExp {
    const pattern = path.replace(/:\w+/g, '([^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  private getParamNames(path: string): string[] {
    return (path.match(/:\w+/g) || []).map(name => name.slice(1));
  }

  parseQuery(urlString: string): Record<string, string> {
    try {
      const parsed = new URL(urlString, 'http://localhost');
      const query: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      return query;
    } catch {
      return {};
    }
  }

  find(method: string, urlPath: string): RouteMatch | null {
    for (const route of this.routes) {
      if (route.method === method) {
        if (route.path.includes(':')) {
          const pattern = this.pathToRegex(route.path);
          const match = urlPath.match(pattern);
          
          if (match) {
            const paramNames = this.getParamNames(route.path);
            const params: Record<string, string> = {};
            
            paramNames.forEach((name, index) => {
              params[name] = match[index + 1];
            });
            
            return { ...route, params };
          }
        } else {
          if (route.path === urlPath) {
            return { ...route, params: {} };
          }
        }
      }
    }
    return null;
  }

  getGlobalMiddlewares(): MiddlewareHandler[] {
    return this.globalMiddlewares;
  }
}
