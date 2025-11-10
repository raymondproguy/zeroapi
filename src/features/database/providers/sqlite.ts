/**
 * SQLite Provider - Perfect for development
 */

import { BaseProvider } from './base-provider.js';
import { DatabaseOptions, QueryOptions } from '../types.js';

export class SQLiteProvider extends BaseProvider {
  name = 'sqlite';
  private data: Map<string, any[]> = new Map();

  async connect(): Promise<void> {
    if (this.connected) return;
    
    console.log('🗃️  Connecting to SQLite database...');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.connected = true;
    console.log('✅ SQLite connected successfully');
  }

  async disconnect(): Promise<void> {
    this.data.clear();
    this.connected = false;
    console.log('🔌 SQLite disconnected');
  }

  async findMany(model: string, options: QueryOptions = {}): Promise<any[]> {
    this.validateConnection();
    
    const items = this.data.get(model) || [];
    let filtered = [...items];

    // Apply WHERE filtering
    if (options.where) {
      filtered = filtered.filter(item => {
        return Object.entries(options.where!).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    // Apply LIMIT
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    console.log(`📊 SQLite findMany: ${model} → ${filtered.length} items`);
    return filtered;
  }

  async findUnique(model: string, where: any): Promise<any | null> {
    this.validateConnection();
    
    const items = this.data.get(model) || [];
    const item = items.find(item => {
      return Object.entries(where).every(([key, value]) => {
        return item[key] === value;
      });
    });

    console.log(`🔍 SQLite findUnique: ${model} → ${item ? 'found' : 'not found'}`);
    return item || null;
  }

  async create(model: string, data: any): Promise<any> {
    this.validateConnection();
    
    if (!this.data.has(model)) {
      this.data.set(model, []);
    }

    const item = {
      id: this.generateId(),
      ...this.sanitizeData(data),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.get(model)!.push(item);
    
    console.log(`📝 SQLite create: ${model} → ${item.id}`);
    return item;
  }

  async update(model: string, where: any, data: any): Promise<any> {
    this.validateConnection();
    
    const items = this.data.get(model) || [];
    const index = items.findIndex(item => {
      return Object.entries(where).every(([key, value]) => {
        return item[key] === value;
      });
    });

    if (index === -1) {
      throw new Error(`Record not found in ${model}`);
    }

    const updatedItem = {
      ...items[index],
      ...this.sanitizeData(data),
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    
    console.log(`✏️  SQLite update: ${model} → ${updatedItem.id}`);
    return updatedItem;
  }

  async delete(model: string, where: any): Promise<void> {
    this.validateConnection();
    
    const items = this.data.get(model) || [];
    const index = items.findIndex(item => {
      return Object.entries(where).every(([key, value]) => {
        return item[key] === value;
      });
    });

    if (index === -1) {
      throw new Error(`Record not found in ${model}`);
    }

    const deletedItem = items[index];
    items.splice(index, 1);
    
    console.log(`🗑️  SQLite delete: ${model} → ${deletedItem.id}`);
  }

  async count(model: string, where?: any): Promise<number> {
    this.validateConnection();
    
    const items = this.data.get(model) || [];
    let filtered = items;

    if (where) {
      filtered = items.filter(item => {
        return Object.entries(where).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    return filtered.length;
  }
}
