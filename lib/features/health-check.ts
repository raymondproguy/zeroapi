/**
 * Health Check Feature for ZeroAPI
 * Provides system health monitoring endpoint
 */

export class HealthCheck {
  private enabled: boolean = false;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Enable health check
   */
  enable(): this {
    this.enabled = true;
    return this;
  }

  /**
   * Get health check data
   */
  getStatus(): any {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      uptimeHuman: this.formatUptime(process.uptime()),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  /**
   * Format uptime to human readable
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  /**
   * Health check middleware
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      if (req.path === '/health' && req.method === 'GET') {
        const healthData = this.getStatus();
        res.json(healthData);
        return; // Stop middleware chain
      }
      next();
    };
  }

  /**
   * Check if health check is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
