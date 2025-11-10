/**
 * Enhanced Request Class
 */

import { IncomingMessage } from 'http';
import { ZeroRequest, RequestContext } from '../types/core.js';

export class Request implements ZeroRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
  context: RequestContext;

  constructor(
    req: IncomingMessage,
    params: Record<string, string> = {},
    query: Record<string, string> = {},
    body: any = {},
    context: RequestContext = {}
  ) {
    this.method = req.method || 'GET';
    this.url = req.url || '/';
    this.headers = req.headers;
    this.params = params;
    this.query = query;
    this.body = body;
    this.context = context;
  }
}
