/**
 * Enhanced Response Class
 */

import { ServerResponse } from 'http';
import { ZeroResponse } from '../types/core.js';

export class Response implements ZeroResponse {
  private res: ServerResponse;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  status(code: number): Response {
    this.res.statusCode = code;
    return this;
  }

  json(data: any): void {
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(data));
  }

  send(data: any): void {
    if (typeof data === 'object') {
      this.json(data);
    } else {
      this.res.end(data);
    }
  }

  // ServerResponse methods
  setHeader(name: string, value: string | string[]): this {
    this.res.setHeader(name, value);
    return this;
  }

  writeHead(statusCode: number, headers?: any): this {
    this.res.writeHead(statusCode, headers);
    return this;
  }

  end(data?: any): this {
    this.res.end(data);
    return this;
  }
}
