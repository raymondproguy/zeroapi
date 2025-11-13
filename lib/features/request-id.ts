/**
 * Request ID & Timing Feature for ZeroAPI
 * Adds unique IDs and response timing to requests
 */

export class RequestId {
  private enabled: boolean = false;

  /**
   * Enable request ID
   */
  enable(): this {
    this.enabled = true;
    return this;
  }

  /**
   * Generate unique request ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + 
           Date.now().toString(36);
  }

  /**
   * Request ID middleware
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      if (!this.enabled) return next();

      // Generate unique request ID
      req.id = this.generateId();
      
      // Add request ID to response headers
      res.setHeader('X-Request-ID', req.id);
      
      // Measure response time
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        
        // Log request completion
        console.log(`✅ ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - ID: ${req.id}`);
      });

      next();
    };
  }

  /**
   * Check if request ID is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
