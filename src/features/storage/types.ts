/**
 * Storage Type Definitions
 */

export interface StorageOptions {
  provider: 'local' | 's3' | 'cloudinary';
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimetype: string;
  filename: string;
  uploadedAt: string;
}

export interface FileData {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface StorageProvider {
  name: string;
  initialize(): Promise<void>;
  upload(file: FileData, options?: any): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  listFiles(prefix?: string): Promise<string[]>;
}
