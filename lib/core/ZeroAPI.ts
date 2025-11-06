import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Router } from './Router.js';
import { Request } from './Request.js';
import { Response } from './Response.js';
import { RouteHandler } from './types.js';

export class ZeroAPI {
  private router: Router;

  constructor() {
    this.router = new Router();
  }

  get(path: string, handler: RouteHandler): this {
    this.router.add('GET', path, handler);
    return this;
  }

  post(path: string, handler: RouteHandler): this {
    this.router.add('POST', path, handler);
    return this;
  }

  put(path: string, handler: RouteHandler): this {
    this.router.add('PUT', path, handler);
    return this;
  }

  delete(path: string, handler: RouteHandler): this {
    this.router.add('DELETE', path, handler);
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
        await route.handler(request, response);
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Route not found' }));
    }
  }
}
