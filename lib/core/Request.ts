import { IncomingMessage } from 'http';
import { Request as RequestInterface } from './types.js';

export class Request implements RequestInterface {
  method: string;
  url: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;

  constructor(
    req: IncomingMessage,
    routeParams: Record<string, string>,
    queryParams: Record<string, string>,
    body: any = {}
  ) {
    this.method = req.method || 'GET';
    this.url = req.url || '/';
    this.path = this.url.split('?')[0];
    this.headers = req.headers;
    this.params = routeParams;
    this.query = queryParams;
    this.body = body;
  }
}
