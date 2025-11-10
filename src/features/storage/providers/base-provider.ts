/**
 * Base Storage Provider - All providers extend this
 */

import { StorageProvider, FileData, UploadResult } from '../types.js';

export abstract class BaseStorageProvider implements StorageProvider {
  abstract name: string;
  protected initialized: boolean = false;

  abstract initialize(): Promise<void>;
  abstract upload(file: FileData, options?: any): Promise<UploadResult>;
  abstract delete(key: string): Promise<void>;
  abstract getUrl(key: string): Promise<string>;
  abstract listFiles(prefix?: string): Promise<string[]>;

  protected validateInitialization(): void {
    if (!this.initialized) {
      throw new Error(`Storage provider ${this.name} is not initialized`);
    }
  }

  protected generateKey(filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = filename.split('.').pop();
    return `file_${timestamp}_${random}.${extension}`;
  }

  protected validateFile(file: FileData): void {
    if (!file.buffer || file.buffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }

    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'text/plain',
      'application/json'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }
  }

  protected getFileExtension(mimetype: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/json': 'json'
    };
    return extensions[mimetype] || 'bin';
  }
}
