import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Router } from './Router.js';
import { Request } from './Request.js';
import { Response } from './Response.js';
import { RouteHandler, MiddlewareHandler, NextFunction } from './types.js';
import { serveStatic } from '../features/static.js';

export class ZeroAPI {
  private router: Router;
  private staticMiddlewares: MiddlewareHandler[] = []; // 🆕 Separate static middlewares

  constructor() {
    this.router = new Router();
  }

  use(middleware: MiddlewareHandler): this {
    this.router.use(middleware);
    return this;
  }

  static(path: string): this {
    console.log(`📁 Registering static serving for: ${path}`);
    // 🆕 Add to separate static middlewares that run FIRST
    this.staticMiddlewares.push(serveStatic(path));
    return this;
  }

  get(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
    this.router.add('GET', path, ...handlers);
    return this;
  }

  post(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
    this.router.add('POST', path, ...handlers);
    return this;
  }

  put(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
    this.router.add('PUT', path, ...handlers);
    return this;
  }

  delete(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
    this.router.add('DELETE', path, ...handlers);
    return this;
  }

  private setupCORS(res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  private async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve) => {
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (error) {
            resolve({});
          }
        });
      } else {
        resolve({});
      }
    });
  }

  listen(port: number, callback?: () => void): this {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      await this.handleRequest(req, res);
    });

    server.listen(port, callback);
    return this;
  }

  private async executeHandlers(
    handlers: RouteHandler[], 
    request: Request, 
    response: Response
  ): Promise<void> {
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      try {
        await handler(request, response);
      } catch (error) {
        if (handler.length === 3) {
          await handler(request, response, (err: any) => { throw err || error; });
        } else {
          throw error;
        }
      }
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    this.setupCORS(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(200).end();
      return;
    }

    const body = await this.parseBody(req);
    const urlPath = req.url?.split('?')[0] || '/';
    const request = new Request(req, {}, {}, body); // Empty params/query for now
    const response = new Response(res);

    try {
      // 🆕 1. FIRST try static file serving
      console.log(`🔍 Checking static files for: ${urlPath}`);
      for (const staticMiddleware of this.staticMiddlewares) {
        let staticHandled = false;
        
        await new Promise((resolve, reject) => {
          staticMiddleware(request, response, (err?: any) => {
            if (err) {
              reject(err);
            } else {
              // If response was sent, static middleware handled it
              staticHandled = res.headersSent;
              resolve(undefined);
            }
          });
        });

        // If static middleware sent a response, stop here
        if (res.headersSent) {
          console.log(`✅ Static file served: ${urlPath}`);
          return;
        }
      }

      // 🆕 2. If no static file found, THEN try API routes
      console.log(`🔍 No static file found, checking API routes: ${urlPath}`);
      const route = this.router.find(req.method || 'GET', urlPath);

      if (route) {
        // Update request with route params and query
        (request as any).params = route.params;
        (request as any).query = this.router.parseQuery(req.url || '');

        const globalMiddlewares = this.router.getGlobalMiddlewares();
        const globalHandlers: RouteHandler[] = globalMiddlewares.map(middleware => {
          return (req: any, res: any, next?: any) => {
            return new Promise((resolve, reject) => {
              middleware(req, res, (error?: any) => {
                if (error) reject(error);
                else resolve();
              });
            });
          };
        });

        const allHandlers = [...globalHandlers, ...route.handlers];
        await this.executeHandlers(allHandlers, request, response);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route not found' }));
      }
      
    } catch (error) {
      console.error('Error in request handling:', error);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }
  }
}
