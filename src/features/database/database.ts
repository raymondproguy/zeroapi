/**
 * Main Database Class - Unified interface for all providers
 */

import { DatabaseOptions, DatabaseProvider, QueryOptions } from './types.js';
import { SQLiteProvider } from './providers/sqlite.js';
import { PostgreSQLProvider } from './providers/postgresql.js';
import { MongoDBProvider } from './providers/mongodb.js';

export class Database {
  private provider: DatabaseProvider;
  private options: DatabaseOptions;

  constructor(options: DatabaseOptions = { provider: 'sqlite' }) {
    this.options = options;
    this.provider = this.createProvider(options);
  }

  private createProvider(options: DatabaseOptions): DatabaseProvider {
    switch (options.provider) {
      case 'postgresql':
        return new PostgreSQLProvider(options);
      case 'mongodb':
        return new MongoDBProvider(options);
      case 'sqlite':
      default:
        return new SQLiteProvider(options);
    }
  }

  async connect(): Promise<void> {
    await this.provider.connect();
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }

  // CRUD Operations
  async findMany(model: string, options?: QueryOptions): Promise<any[]> {
    return await this.provider.findMany(model, options);
  }

  async findUnique(model: string, where: any): Promise<any | null> {
    return await this.provider.findUnique(model, where);
  }

  async create(model: string, data: any): Promise<any> {
    return await this.provider.create(model, data);
  }

  async update(model: string, where: any, data: any): Promise<any> {
    return await this.provider.update(model, where, data);
  }

  async delete(model: string, where: any): Promise<void> {
    await this.provider.delete(model, where);
  }

  async count(model: string, where?: any): Promise<number> {
    return await this.provider.count(model, where);
  }

  // Utility methods
  getProviderName(): string {
    return this.provider.name;
  }

  isConnected(): boolean {
    return (this.provider as any).connected === true;
  }
}
