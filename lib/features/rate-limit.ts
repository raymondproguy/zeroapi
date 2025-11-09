/**
 * Rate Limiting Feature for ZeroAPI
 * Provides request rate limiting to prevent abuse and DDoS attacks
 */

import { RateLimitOptions } from '../core/types.js';

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

export class RateLimit {
    private enabled: boolean = false;
    private options: Required<RateLimitOptions>;
    private store: Map<string, RateLimitRecord>;

    constructor(options: RateLimitOptions) {
        if (!options.windowMs || !options.max) {
            throw new Error('RateLimit requires windowMs and max options');
        }

        this.options = {
            message: 'Too many requests, please try again later.',
            skip: () => false,
            ...options
        };
        this.store = new Map();
    }

    /**
     * Enable rate limiting
     */
    enable(): this {
        this.enabled = true;
        return this;
    }

    /**
     * Apply rate limiting to request
     */
    async apply(req: any, res: any): Promise<boolean> {
        if (!this.enabled) return true;

        // Skip rate limiting if skip function returns true
        if (this.options.skip(req)) {
            return true;
        }

        const key = this.getClientKey(req);
        const now = Date.now();
        const record = this.store.get(key);

        // Clean up old records periodically (every 100 checks)
        if (Math.random() < 0.01) {
            this.cleanup();
        }

        if (!record || now > record.resetTime) {
            // New time window or first request
            const newRecord: RateLimitRecord = {
                count: 1,
                resetTime: now + this.options.windowMs
            };
            this.store.set(key, newRecord);
            this.setHeaders(res, 1, newRecord.resetTime);
            return true;
        }

        // Increment count in current window
        record.count++;
        this.setHeaders(res, record.count, record.resetTime);

        if (record.count > this.options.max) {
            // Rate limit exceeded
            this.sendRateLimitResponse(res, record.resetTime);
            return false;
        }

        return true;
    }

    /**
     * Generate client key based on IP address
     */
    private getClientKey(req: any): string {
        // Try to get IP from various headers, fallback to connection remoteAddress
        const forwarded = req.headers['x-forwarded-for'];
        const realIp = req.headers['x-real-ip'];
        const connectionIp = req.connection?.remoteAddress;
        
        let ip = realIp || connectionIp || 'unknown';
        
        if (forwarded) {
            ip = forwarded.split(',')[0].trim();
        }

        return ip;
    }

    /**
     * Set rate limit headers on response
     */
    private setHeaders(res: any, current: number, resetTime: number): void {
        res.setHeader('X-RateLimit-Limit', this.options.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.options.max - current));
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
    }

    /**
     * Send rate limit exceeded response
     */
    private sendRateLimitResponse(res: any, resetTime: number): void {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
        res.setHeader('Retry-After', retryAfter);
        res.status(429).json({
            error: 'Rate Limit Exceeded',
            message: this.options.message,
            retryAfter: `${retryAfter} seconds`
        });
    }

    /**
     * Clean up expired rate limit records
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetTime) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Reset rate limiting for a specific client
     */
    reset(key: string): void {
        this.store.delete(key);
    }

    /**
     * Get current rate limit record for a client
     */
    getRecord(key: string): RateLimitRecord | undefined {
        return this.store.get(key);
    }

    /**
     * Check if rate limiting is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}
