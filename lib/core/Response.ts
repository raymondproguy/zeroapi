import { ServerResponse } from 'http';
import { Response as ResponseInterface } from './types.js';

export class Response implements ResponseInterface {
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

  sendStatus(code: number): void {
    this.res.statusCode = code;
    this.res.end();
  }

  setHeader(name: string, value: string): void {
    this.res.setHeader(name, value);
  }
}
