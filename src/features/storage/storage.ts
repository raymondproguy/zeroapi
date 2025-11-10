/**
 * Main Storage Class - Unified file storage interface
 */

import { StorageOptions, StorageProvider, FileData, UploadResult } from './types.js';
import { LocalStorageProvider } from './providers/local.js';
import { S3StorageProvider } from './providers/s3.js';
import { CloudinaryStorageProvider } from './providers/cloudinary.js';

export class Storage {
  private provider: StorageProvider;
  private options: StorageOptions;

  constructor(options: StorageOptions = { provider: 'local' }) {
    this.options = options;
    this.provider = this.createProvider(options);
  }

  private createProvider(options: StorageOptions): StorageProvider {
    switch (options.provider) {
      case 's3':
        return new S3StorageProvider(options);
      case 'cloudinary':
        return new CloudinaryStorageProvider(options);
      case 'local':
      default:
        return new LocalStorageProvider(options);
    }
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  // File operations
  async upload(file: FileData, options?: any): Promise<UploadResult> {
    return await this.provider.upload(file, options);
  }

  async delete(key: string): Promise<void> {
    await this.provider.delete(key);
  }

  async getUrl(key: string): Promise<string> {
    return await this.provider.getUrl(key);
  }

  async listFiles(prefix?: string): Promise<string[]> {
    return await this.provider.listFiles(prefix);
  }

  // Utility methods
  getProviderName(): string {
    return this.provider.name;
  }

  isInitialized(): boolean {
    return (this.provider as any).initialized === true;
  }
}
