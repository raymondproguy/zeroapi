/**
 * Database Type Definitions
 */

export interface DatabaseOptions {
  provider: 'sqlite' | 'postgresql' | 'mongodb';
  url?: string;
  host?: string;
  port?: number;
  name?: string;
  username?: string;
  password?: string;
}

export interface QueryOptions {
  where?: any;
  orderBy?: any;
  limit?: number;
  offset?: number;
  include?: any;
}

export interface DatabaseProvider {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findMany(model: string, options?: QueryOptions): Promise<any[]>;
  findUnique(model: string, where: any): Promise<any | null>;
  create(model: string, data: any): Promise<any>;
  update(model: string, where: any, data: any): Promise<any>;
  delete(model: string, where: any): Promise<void>;
  count(model: string, where?: any): Promise<number>;
}

export interface ModelDefinition {
  name: string;
  fields: Record<string, FieldDefinition>;
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'date' | 'json';
  required?: boolean;
  unique?: boolean;
  default?: any;
}
