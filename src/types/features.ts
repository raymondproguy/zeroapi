/**
 * Feature Type Definitions
 */

// Database
export interface DatabaseOptions {
  provider: 'sqlite' | 'postgresql' | 'mongodb';
  url?: string;
  host?: string;
  port?: number;
  name?: string;
}

export interface DatabaseFeature {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findMany(model: string, where?: any): Promise<any[]>;
  create(model: string, data: any): Promise<any>;
  update(model: string, where: any, data: any): Promise<any>;
  delete(model: string, where: any): Promise<void>;
}

// Auth
export interface AuthOptions {
  provider: 'jwt' | 'firebase' | 'auth0';
  secret?: string;
  expiresIn?: string;
}

export interface AuthFeature {
  register(userData: any): Promise<any>;
  login(credentials: any): Promise<any>;
  verifyToken(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}

// Config
export interface ConfigOptions {
  env?: string;
  envFile?: string;
  defaults?: Record<string, any>;
}
