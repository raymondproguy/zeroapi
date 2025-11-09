/**
 * Security Headers Feature for ZeroAPI
 * Provides essential security headers to protect against common attacks
 */

import { SecurityHeadersOptions } from '../core/types.js';

export class SecurityHeaders {
  private enabled: boolean = false;
  private options: Required<SecurityHeadersOptions>;

  constructor(options: SecurityHeadersOptions = {}) {
    this.options = {
      enableCSP: true,
      enableHSTS: true,
      frameguard: 'DENY',
      ...options
    };
  }

  /**
   * Enable security headers
   */
  enable(): this {
    this.enabled = true;
    return this;
  }

  /**
   * Apply security headers to response
   */
  apply(res: any): void {
    if (!this.enabled) return;

    // Remove server fingerprinting
    res.removeHeader('X-Powered-By');

    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', this.options.frameguard);

    // Content Security Policy
    if (this.options.enableCSP) {
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; script-src 'self' 'unsafe-inline'");
    }

    // HSTS for HTTPS (in production)
    if (this.options.enableHSTS && process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  }

  /**
   * Check if security headers are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
