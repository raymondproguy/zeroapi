/**
 * Base Auth Provider - All providers extend this
 */

import { AuthProvider, User, AuthResult, RegisterData, LoginCredentials } from '../types.js';

export abstract class BaseAuthProvider implements AuthProvider {
  abstract name: string;
  protected initialized: boolean = false;
  protected database: any;

  constructor(database?: any) {
    this.database = database;
  }

  abstract initialize(): Promise<void>;
  abstract register(userData: RegisterData): Promise<AuthResult>;
  abstract login(credentials: LoginCredentials): Promise<AuthResult>;
  abstract verifyToken(token: string): Promise<User | null>;
  abstract logout(token: string): Promise<void>;
  abstract refreshToken(token: string): Promise<AuthResult>;

  protected validateInitialization(): void {
    if (!this.initialized) {
      throw new Error(`Auth provider ${this.name} is not initialized`);
    }
  }

  protected generateUserId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  protected async findUserByEmail(email: string): Promise<User | null> {
    if (!this.database) return null;
    
    try {
      return await this.database.findUnique('users', { email });
    } catch {
      return null;
    }
  }

  protected async createUser(userData: any): Promise<User> {
    if (!this.database) {
      // Return mock user if no database
      return {
        id: this.generateUserId(),
        email: userData.email,
        name: userData.name,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return await this.database.create('users', {
      ...userData,
      role: 'user',
      active: true
    });
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validatePassword(password: string): boolean {
    return password && password.length >= 6;
  }
}
