import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Router } from './Router.js';
import { Request } from './Request.js';
import { Response } from './Response.js';
import { RouteHandler, MiddlewareHandler, HotReloadOptions } from './types.js';
import { serveStatic } from '../features/static.js';
import { createErrorHandler } from '../features/error-handler.js';
import { SecurityHeaders } from '../features/security.js';
import { Compression } from '../features/compression.js';
import { RateLimit } from '../features/rate-limit.js';
import { HotReload, DevUtils } from '../features/hot-reload.js'; 
import { SwaggerDocs } from '../features/swagger.js';

export class ZeroAPI {
  private router: Router;
  private staticMiddlewares: MiddlewareHandler[] = [];
  private errorHandler: any;
  private security: SecurityHeaders;
  private compression : Compression;
  private rateLimit: RateLimit;
  private hotReload: HotReload;
  private server: any = null;
  private swagger: SwaggerDocs | null;
  private server: any = null;

  constructor() {
    this.router = new Router();
    this.staticMiddlewares = [];
    this.errorHandler = createErrorHandler();   
    this.security = new SecurityHeaders();
    this.compression = new Compression();
    this.rateLimit = new RateLimit({ windowMs: 900000, max: 100 }); // Default: 100 req/15min 
    this.hotReload = new HotReload();
    this.swagger = null;
  }

  // 🆕 Register custom error handler
  onError(handler: (error: any, req: any, res: any) => void): this {
    this.errorHandler = handler;
    return this;
  }

  use(middleware: MiddlewareHandler): this {
    this.router.use(middleware);
    return this;
  }

  // === SECURITY HEADERS FEATURE ===
useSecurityHeaders(options?: SecurityHeadersOptions): this {
  this.security = new SecurityHeaders(options);
  this.security.enable();
  return this;
}
 // === COMPRESSION FEATURE ===
useCompression(options?: CompressionOptions): this {
  this.compression = new Compression(options);
  this.compression.enable();
  return this;
}

// === RATE LIMITING FEATURE ===
useRateLimit(options: RateLimitOptions): this {
  this.rateLimit = new RateLimit(options);
  this.rateLimit.enable();
  return this;
}

// === HOT RELOAD FEATURE ===
enableHotReload(options?: HotReloadOptions): this {
  this.hotReload = new HotReload(options);
  this.hotReload.onRestart(() => {
    this.restartServer();
  }).enable();
  return this;
}

// === SWAGGER DOCUMENTATION FEATURE ===
swagger(options: SwaggerOptions): this {
  this.swagger = new SwaggerDocs(options);
  this.swagger.enable();
  
  // Add Swagger UI routes
  this.setupSwaggerRoutes();
  return this;
}

  static(path: string): this {
    this.staticMiddlewares.push(serveStatic(path));
    return this;
  }

  // === SWAGGER DOCUMENTATION FEATURE ===
// Override route methods to capture documentation
get(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
  this.router.add('GET', path, ...handlers);
  this.captureRouteDoc('GET', path, handlers);
  return this;
}

post(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
  this.router.add('POST', path, ...handlers);
  this.captureRouteDoc('POST', path, handlers);
  return this;
}

put(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
  this.router.add('PUT', path, ...handlers);
  this.captureRouteDoc('PUT', path, handlers);
  return this;
}

delete(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): this {
  this.router.add('DELETE', path, ...handlers);
  this.captureRouteDoc('DELETE', path, handlers);
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
  this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    await this.handleRequest(req, res);
  });

  this.server.listen(port, () => {
    if (callback) callback();

    // Print development info
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode detected');
      console.log('💡 Use .enableHotReload() for automatic restart on file changes');
    }
  });
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


// === HOT RELOAD FEATURE ===
private restartServer(): void {
  if (this.server) {
    console.log('♻️  Closing existing server...');
    this.server.close(() => {
      console.log('✅ Server closed');
      this.startServer();
    });
  } else {
    this.startServer();
  }
}

private startServer(): void {
  this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    await this.handleRequest(req, res);
  });

  // Get the port from the original server or use default
  const port = this.server.address()?.port || 3000;
  this.server.listen(port, () => {
    console.log(`🚀 ZeroAPI server restarted on http://localhost:${port}`);

    // Print development info
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Hot reload is active - files are being watched');
      console.log('💡 Make changes to your files and see the server restart automatically!\n');
    }
  });
}

// === SWAGGER DOCUMENTATION FEATURE ===
private captureRouteDoc(method: string, path: string, handlers: any[]): void {
  if (!this.swagger || !this.swagger.isEnabled()) return;

  // Look for documentation in handlers
  for (const handler of handlers) {
    if (handler._docs) {
      // Handler has documentation attached via decorator
      for (const [handlerName, docs] of handler._docs) {
        this.swagger.documentRoute(method, path, docs);
      }
    }
  }
}

private setupSwaggerRoutes(): void {
  if (!this.swagger) return;

  const basePath = this.swagger.getBasePath();

  // Serve OpenAPI JSON specification
  this.get(`${basePath}/json`, (req: any, res: any) => {
    const spec = this.swagger!.generateSpec();
    res.json(spec);
  });

  // Serve Swagger UI
  this.get(`${basePath}`, (req: any, res: any) => {
    const html = this.swagger!.generateUI();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Serve Swagger UI assets (fallback)
  this.get(`${basePath}/*`, (req: any, res: any) => {
    res.redirect(`https://unpkg.com/swagger-ui-dist@3/${req.params[0]}`);
  });

  console.log(`📚 Swagger UI available at http://localhost:3000${basePath}`);
}

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    this.setupCORS(res);
    this.security.apply(res);
    this.compression.apply(req, res);
    const request = new Request(req, {}, {}, {});
    const rateLimitAllowed = await this.rateLimit.apply(request, res);
    if (!rateLimitAllowed) {
      return; // Rate limit exceeded, response already sent
    }


    if (req.method === 'OPTIONS') {
      res.writeHead(200).end();
      return;
    }

    const body = await this.parseBody(req);
    const urlPath = req.url?.split('?')[0] || '/';
    const request = new Request(req, {}, {}, body);
    const response = new Response(res);

    try {
      // 1. Try static file serving
      for (const staticMiddleware of this.staticMiddlewares) {
        let staticHandled = false;
        
        await new Promise((resolve, reject) => {
          staticMiddleware(request, response, (err?: any) => {
            if (err) {
              reject(err);
            } else {
              staticHandled = res.headersSent;
              resolve(undefined);
            }
          });
        });

        if (res.headersSent) {
          return;
        }
      }

      // 2. Try API routes
      const route = this.router.find(req.method || 'GET', urlPath);

      if (route) {
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
        // Use NotFoundError for 404s
        const { NotFoundError } = await import('../features/errors.js');
        throw new NotFoundError(`Route ${urlPath} not found`);
      }
      
    } catch (error) {
      // Use the error handler
      this.errorHandler(error, request, response);
    }
  }
}
