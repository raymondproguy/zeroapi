import { IncomingMessage, ServerResponse } from 'http';

export interface Route {
  method: string;
  path: string;
  handlers: RouteHandler[];
}

export interface RouteMatch extends Route {
  params: Record<string, string>;
}

export type NextFunction = (error?: any) => void | Promise<void>;
export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
export type RouteHandler = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

export interface Request {
  method: string;
  url: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
}

export interface Response {
  status(code: number): Response;
  json(data: any): void;
  send(data: any): void;
  sendStatus(code: number): void;
  setHeader(name: string, value: string): void;
}

// === SECURITY HEADERS FEATURE ===
export interface SecurityHeadersOptions {
    enableCSP?: boolean;
    enableHSTS?: boolean;
    frameguard?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
}

// === COMPRESSION FEATURE ===
export interface CompressionOptions {
    threshold?: number; // Minimum response size to compre>
    level?: number;     // Compression level (1-9)
}


// === RATE LIMITING FEATURE ===
export interface RateLimitOptions {
    windowMs: number;           // Time window in milliseconds
    max: number;                // Max requests per window
    message?: string;           // Custom error message
    skip?: (req: Request) => boolean; // Function to skip rate limiting
}

// === ZEROAPI INTERFACE ===
export interface ZeroAPI {
    // Core methods (from existing ZeroAPI class)
    use(middleware: MiddlewareHandler): ZeroAPI;
    static(path: string): ZeroAPI;
    get(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): ZeroAPI;
    post(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): ZeroAPI;
    put(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): ZeroAPI;
    delete(path: string, ...handlers: (RouteHandler | MiddlewareHandler)[]): ZeroAPI;
    onError(handler: (error: any, req: any, res: any) => void): ZeroAPI;
    listen(port: number, callback?: () => void): ZeroAPI;
    
    useSecurityHeaders(options?: SecurityHeadersOptions): ZeroAPI;
    useCompression(options?: CompressionOptions): ZeroAPI;
    useRateLimit(options: RateLimitOptions): ZeroAPI;
    testing(): any;
    enableHotReload(options?: HotReloadOptions): ZeroAPI;
    swagger(options: SwaggerOptions): ZeroAPI;
}
