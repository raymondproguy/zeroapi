/**
 * Main Auth Class - Unified authentication interface
 */

import { AuthOptions, AuthProvider, User, AuthResult, RegisterData, LoginCredentials } from './types.js';
import { JWTProvider } from './providers/jwt.js';
import { FirebaseProvider } from './providers/firebase.js';

export class Auth {
  private provider: AuthProvider;
  private options: AuthOptions;

  constructor(options: AuthOptions, database?: any) {
    this.options = options;
    this.provider = this.createProvider(options, database);
  }

  private createProvider(options: AuthOptions, database?: any): AuthProvider {
    switch (options.provider) {
      case 'firebase':
        return new FirebaseProvider(options, database);
      case 'jwt':
      default:
        return new JWTProvider(options, database);
    }
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  // Authentication operations
  async register(userData: RegisterData): Promise<AuthResult> {
    return await this.provider.register(userData);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    return await this.provider.login(credentials);
  }

  async verifyToken(token: string): Promise<User | null> {
    return await this.provider.verifyToken(token);
  }

  async logout(token: string): Promise<void> {
    await this.provider.logout(token);
  }

  async refreshToken(token: string): Promise<AuthResult> {
    return await this.provider.refreshToken(token);
  }

  // Utility methods
  getProviderName(): string {
    return this.provider.name;
  }

  isInitialized(): boolean {
    return (this.provider as any).initialized === true;
  }
}
