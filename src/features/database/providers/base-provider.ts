/**
 * Base Database Provider - All providers extend this
 */

import { DatabaseProvider, QueryOptions } from '../types.js';

export abstract class BaseProvider implements DatabaseProvider {
  abstract name: string;
  protected connected: boolean = false;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  
  abstract findMany(model: string, options?: QueryOptions): Promise<any[]>;
  abstract findUnique(model: string, where: any): Promise<any | null>;
  abstract create(model: string, data: any): Promise<any>;
  abstract update(model: string, where: any, data: any): Promise<any>;
  abstract delete(model: string, where: any): Promise<void>;
  abstract count(model: string, where?: any): Promise<number>;

  protected validateConnection(): void {
    if (!this.connected) {
      throw new Error(`Database provider ${this.name} is not connected`);
    }
  }

  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  protected sanitizeData(data: any): any {
    // Remove undefined values, add timestamps, etc.
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });
    
    return sanitized;
  }
}
