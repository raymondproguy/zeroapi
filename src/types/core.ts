/**
 * Core Type Definitions for ZeroAPI v2
 */

import { IncomingMessage, ServerResponse } from 'http';

// Request/Response
export interface ZeroRequest extends IncomingMessage {
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
  context: RequestContext;
}

export interface ZeroResponse extends ServerResponse {
  json(data: any): void;
  send(data: any): void;
  status(code: number): ZeroResponse;
}

export interface RequestContext {
  db?: any;
  auth?: any;
  config?: any;
  user?: any;
}

// Routing
export type RouteHandler = (req: ZeroRequest, res: ZeroResponse) => void | Promise<void>;
export type MiddlewareHandler = (req: ZeroRequest, res: ZeroResponse, next: () => void) => void | Promise<void>;

export interface Route {
  method: string;
  path: string;
  handlers: RouteHandler[];
}

export interface RouteMatch extends Route {
  params: Record<string, string>;
}

// Features
export interface Feature {
  name: string;
  initialize(app: ZeroAPI): void;
  cleanup?(): void;
}
