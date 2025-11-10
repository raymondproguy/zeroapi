/**
 * Local Storage Provider - For development
 */

import { writeFileSync, unlinkSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { BaseStorageProvider } from './base-provider.js';
import { StorageOptions, FileData, UploadResult } from '../types.js';

export class LocalStorageProvider extends BaseStorageProvider {
  name = 'local';
  private options: StorageOptions;
  private uploadDir: string;

  constructor(options: StorageOptions) {
    super();
    this.options = options;
    this.uploadDir = join(process.cwd(), 'uploads');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('💾 Initializing local storage...');
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
      console.log(`📁 Created upload directory: ${this.uploadDir}`);
    }

    this.initialized = true;
    console.log('✅ Local storage ready');
  }

  async upload(file: FileData, options?: any): Promise<UploadResult> {
    this.validateInitialization();
    this.validateFile(file);

    const key = this.generateKey(file.originalname);
    const filePath = join(this.uploadDir, key);

    // Write file to disk
    writeFileSync(filePath, file.buffer);

    const result: UploadResult = {
      url: `/uploads/${key}`,
      key,
      size: file.size,
      mimetype: file.mimetype,
      filename: file.originalname,
      uploadedAt: new Date().toISOString()
    };

    console.log(`📁 Local storage uploaded: ${file.originalname} → ${key}`);
    return result;
  }

  async delete(key: string): Promise<void> {
    this.validateInitialization();

    const filePath = join(this.uploadDir, key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      console.log(`🗑️  Local storage deleted: ${key}`);
    } else {
      throw new Error(`File not found: ${key}`);
    }
  }

  async getUrl(key: string): Promise<string> {
    this.validateInitialization();
    return `/uploads/${key}`;
  }

  async listFiles(prefix?: string): Promise<string[]> {
    this.validateInitialization();
    
    if (!existsSync(this.uploadDir)) {
      return [];
    }

    const files = readdirSync(this.uploadDir);
    if (prefix) {
      return files.filter(file => file.startsWith(prefix));
    }
    
    return files;
  }
}
