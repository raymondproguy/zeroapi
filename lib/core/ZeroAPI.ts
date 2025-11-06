import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Router } from './Router.js';
import { Request } from './Request.js';
import { Response } from './Response.js';
import { RouteHandler, MiddlewareHandler, NextFunction } from './types.js';
import { serveStatic } from '../features/static.js';

export class ZeroAPI {
  private router: Router;

  constructor() {
    this.router = new Router();
  }

  use(middleware: MiddlewareHandler): this {
    this.router.use(middleware);
    return this;
  }

  static(path: string): this {
    this.router.use(serveStatic(path));
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
    const route = this.router.find(req.method || 'GET', urlPath);

    if (route) {
      const request = new Request(req, route.params, this.router.parseQuery(req.url || ''), body);
      const response = new Response(res);

      try {
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
        
      } catch (error) {
        console.error('Error in request handling:', error);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Route not found' }));
    }
  }
}
