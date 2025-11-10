/**
 * ZeroAPI v2 - Clean, Professional Backend Framework
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Router } from './Router.js';
import { Request } from './Request.js';
import { Response } from './Response.js';
import { ZeroRequest, ZeroResponse, RouteHandler, Feature } from '../types/core.js';
import { Database } from '../features/database/database.js';
import { Auth } from '../features/auth/auth.js';
import { Config } from '../features/config/config.js';
import { Storage } from '../features/storage/storage.js';
import { Payments } from '../features/payments/payments.js';

export class ZeroAPI {
  private router: Router;
  private server: any = null;
  private features: Map<string, Feature> = new Map();
  private context: any = {};

  constructor() {
    this.router = new Router();
    this.initializeCore();
  }

  /**
   * Initialize core framework
   */
  private initializeCore(): void {
    console.log('🚀 ZeroAPI v2 - Professional Backend Framework');
  }

  /**
   * Database Feature
   */
  database(options?: any): this {
    const db = new Database(options);
    this.features.set('database', db);
    this.context.db = db;
    return this;
  }

  /**
   * Authentication Feature
   */
  auth(options?: any): this {
  if (!this.context.db) {
    console.warn('⚠️  Auth initialized without database - using in-memory storage');
  }
  
  const auth = new Auth(options || { provider: 'jwt' }, this.context.db);
  this.features.set('auth', auth);
  this.context.auth = auth;
  return this;
}

  /**
   * Configuration
   */
  configure(options?: any): this {
    const config = new Config(options);
    this.features.set('config', config);
    this.context.config = config;
    return this;
  }
  
  /**
 * Storage Feature
 */
  storage(options?: any): this {
  const storage = new Storage(options || { provider: 'local' });
  this.features.set('storage', storage);
  this.context.storage = storage;
  return this;
}

  /**
 * Payments Feature
 */
  payments(options?: any): this {
  const payments = new Payments(options || { provider: 'stripe' });
  this.features.set('payments', payments);
  this.context.payments = payments;
  return this;
}

  /**
   * Routing Methods
   */
  use(handler: any): this {
    this.router.use(handler);
    return this;
  }

  get(path: string, ...handlers: any[]): this {
    this.router.add('GET', path, ...handlers);
    return this;
  }

  post(path: string, ...handlers: any[]): this {
    this.router.add('POST', path, ...handlers);
    return this;
  }

  put(path: string, ...handlers: any[]): this {
    this.router.add('PUT', path, ...handlers);
    return this;
  }

  delete(path: string, ...handlers: any[]): this {
    this.router.add('DELETE', path, ...handlers);
    return this;
  }

  /**
   * Server Lifecycle
   */
  async listen(port: number, callback?: () => void): Promise<this> {
    // Initialize all features
    await this.initializeFeatures();

    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      await this.handleRequest(req, res);
    });

    this.server.listen(port, () => {
      console.log(`🎯 Server running on http://localhost:${port}`);
      console.log('📚 Features loaded:', Array.from(this.features.keys()));
      if (callback) callback();
    });

    return this;
  }

  private async initializeFeatures(): Promise<void> {
    for (const [name, feature] of this.features) {
      if (typeof (feature as any).initialize === 'function') {
        await (feature as any).initialize(this);
      }
    }
  }

  /**
   * Request Handling
   */
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const urlPath = req.url?.split('?')[0] || '/';
    const query = this.router.parseQuery(req.url || '');
    
    const zeroRequest = new Request(req, {}, query, {}, this.context);
    const zeroResponse = new Response(res);

    try {
      const route = this.router.find(req.method || 'GET', urlPath);

      if (route) {
        zeroRequest.params = route.params;
        await this.executeRoute(route, zeroRequest, zeroResponse);
      } else {
        zeroResponse.status(404).send('Not Found');
      }
    } catch (error) {
      console.error('Request error:', error);
      zeroResponse.status(500).send('Internal Server Error');
    }
  }

  private async executeRoute(route: any, req: ZeroRequest, res: ZeroResponse): Promise<void> {
    const globalMiddlewares = this.router.getGlobalMiddlewares();
    const allHandlers = [...globalMiddlewares, ...route.handlers];

    for (const handler of allHandlers) {
      await handler(req, res);
    }
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    if (this.server) {
      this.server.close();
    }

    // Cleanup features
    for (const [name, feature] of this.features) {
      if (typeof (feature as any).cleanup === 'function') {
        await (feature as any).cleanup();
      }
    }
  }
}
