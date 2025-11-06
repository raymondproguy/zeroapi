import { IncomingMessage, ServerResponse } from 'http';

export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

export interface RouteMatch extends Route {
  params: Record<string, string>;
}

export type RouteHandler = (req: Request, res: Response) => void | Promise<void>;

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
}
