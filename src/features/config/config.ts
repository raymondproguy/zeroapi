/**
 * Configuration Management - Essential for any app
 */

export interface ConfigOptions {
  appName?: string;
  environment?: 'development' | 'production' | 'test';
  port?: number;
  databaseUrl?: string;
  secretKey?: string;
}

export class Config {
  private options: ConfigOptions;
  private config: Map<string, any> = new Map();

  constructor(options: ConfigOptions = {}) {
    this.options = {
      appName: 'ZeroAPI App',
      environment: 'development',
      port: 3000,
      ...options
    };
    
    this.initializeDefaultConfig();
  }

  private initializeDefaultConfig(): void {
    // Core app config
    this.set('app.name', this.options.appName);
    this.set('app.environment', this.options.environment);
    this.set('app.port', this.options.port);
    
    // Database
    this.set('database.url', this.options.databaseUrl);
    
    // Security
    this.set('security.secretKey', this.options.secretKey || this.generateSecretKey());
    
    // Features
    this.set('features.database.enabled', true);
    this.set('features.auth.enabled', true);
    this.set('features.payments.enabled', false);
    this.set('features.email.enabled', false);
  }

  // Basic config operations
  get(key: string): any {
    return this.config.get(key);
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  // Environment-specific config
  isProduction(): boolean {
    return this.get('app.environment') === 'production';
  }

  isDevelopment(): boolean {
    return this.get('app.environment') === 'development';
  }

  // Feature flags
  isFeatureEnabled(feature: string): boolean {
    return this.get(`features.${feature}.enabled`) === true;
  }

  enableFeature(feature: string): void {
    this.set(`features.${feature}.enabled`, true);
  }

  disableFeature(feature: string): void {
    this.set(`features.${feature}.enabled`, false);
  }

  // Secret management
  private generateSecretKey(): string {
    return `secret_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Config validation
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.get('app.name')) {
      errors.push('App name is required');
    }

    if (!this.get('security.secretKey') || this.get('security.secretKey').includes('secret_')) {
      errors.push('Proper secret key is required in production');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get all config (for debugging, never expose in production)
  getAll(): Record<string, any> {
    const all: Record<string, any> = {};
    for (const [key, value] of this.config) {
      all[key] = value;
    }
    return all;
  }
}
