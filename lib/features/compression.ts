/**
 * Compression Feature for ZeroAPI
 * Provides response compression to reduce bandwidth usage
 */

import { createGzip, createDeflate, ZlibOptions } from 'zlib';
import { CompressionOptions } from '../core/types.js';

export class Compression {
  private enabled: boolean = false;
  private options: Required<CompressionOptions>;

  constructor(options: CompressionOptions = {}) {
    this.options = {
      threshold: 1024, // 1KB minimum size
      level: 6,        // Default compression level
      ...options
    };
  }

  /**
   * Enable compression
   */
  enable(): this {
    this.enabled = true;
    return this;
  }

  /**
   * Apply compression to response
   */
  apply(req: any, res: any): void {
    if (!this.enabled) return;

    const acceptedEncodings = req.headers['accept-encoding'] || '';
    const originalSend = res.send;

    // Override res.send to compress responses
    res.send = (data: any) => {
      if (res.headersSent || !data) {
        return originalSend.call(res, data);
      }

      // Check if we should compress this response
      if (!this.shouldCompress(res, data)) {
        return originalSend.call(res, data);
      }

      // Choose compression method
      if (acceptedEncodings.includes('gzip')) {
        this.compressWithGzip(data, res, originalSend);
      } else if (acceptedEncodings.includes('deflate')) {
        this.compressWithDeflate(data, res, originalSend);
      } else {
        originalSend.call(res, data);
      }
    };
  }

  /**
   * Check if response should be compressed
   */
  private shouldCompress(res: any, data: any): boolean {
    // Don't compress if content-type is not compressible
    const contentType = res.getHeader('Content-Type');
    if (!contentType || !this.isCompressibleContentType(contentType)) {
      return false;
    }

    // Don't compress if below threshold
    const dataSize = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(String(data));
    if (dataSize < this.options.threshold) {
      return false;
    }

    return true;
  }

  /**
   * Check if content type is compressible
   */
  private isCompressibleContentType(contentType: string): boolean {
    const compressibleTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'application/javascript',
      'application/json',
      'application/xml',
      'text/xml'
    ];

    return compressibleTypes.some(type => contentType.includes(type));
  }

  /**
   * Compress with GZIP
   */
  private compressWithGzip(data: any, res: any, originalSend: Function): void {
    const gzip = createGzip({ level: this.options.level });
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');

    if (Buffer.isBuffer(data)) {
      gzip.write(data);
    } else {
      gzip.write(String(data));
    }
    
    gzip.end();

    const chunks: Buffer[] = [];
    gzip.on('data', (chunk: Buffer) => chunks.push(chunk));
    gzip.on('end', () => {
      const compressed = Buffer.concat(chunks);
      originalSend.call(res, compressed);
    });
  }

  /**
   * Compress with Deflate
   */
  private compressWithDeflate(data: any, res: any, originalSend: Function): void {
    const deflate = createDeflate({ level: this.options.level });
    res.setHeader('Content-Encoding', 'deflate');
    res.setHeader('Vary', 'Accept-Encoding');

    if (Buffer.isBuffer(data)) {
      deflate.write(data);
    } else {
      deflate.write(String(data));
    }
    
    deflate.end();

    const chunks: Buffer[] = [];
    deflate.on('data', (chunk: Buffer) => chunks.push(chunk));
    deflate.on('end', () => {
      const compressed = Buffer.concat(chunks);
      originalSend.call(res, compressed);
    });
  }

  /**
   * Check if compression is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
