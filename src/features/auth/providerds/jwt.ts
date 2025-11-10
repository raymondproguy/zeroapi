/**
 * JWT Auth Provider - Our default authentication
 */

import { createHmac, randomBytes } from 'crypto';
import { BaseAuthProvider } from './base-provider.js';
import { AuthOptions, User, AuthResult, RegisterData, LoginCredentials } from '../types.js';

export class JWTProvider extends BaseAuthProvider {
  name = 'jwt';
  private options: AuthOptions;
  private secret: string;
  private expiresIn: string;

  constructor(options: AuthOptions, database?: any) {
    super(database);
    this.options = options;
    this.secret = options.secret || this.generateSecret();
    this.expiresIn = options.expiresIn || '7d';
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🔐 Initializing JWT authentication...');
    
    if (!this.secret) {
      throw new Error('JWT secret is required');
    }

    this.initialized = true;
    console.log('✅ JWT authentication ready');
  }

  async register(userData: RegisterData): Promise<AuthResult> {
    this.validateInitialization();

    // Validate input
    if (!this.validateEmail(userData.email)) {
      throw new Error('Invalid email address');
    }

    if (!this.validatePassword(userData.password)) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await this.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await this.createUser({
      email: userData.email,
      name: userData.name,
      passwordHash: this.hashPassword(userData.password)
    });

    // Generate token
    const token = this.generateToken(user);

    console.log(`👤 New user registered: ${user.email}`);
    
    return {
      user: this.sanitizeUser(user),
      token,
      expiresIn: this.getExpiresInSeconds()
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    this.validateInitialization();

    // Validate input
    if (!this.validateEmail(credentials.email)) {
      throw new Error('Invalid email address');
    }

    // Find user
    const user = await this.findUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In real implementation, we would verify password hash
    // For now, we'll simulate password verification
    const passwordValid = await this.verifyPassword(credentials.password, user);
    if (!passwordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    console.log(`🔓 User logged in: ${user.email}`);
    
    return {
      user: this.sanitizeUser(user),
      token,
      expiresIn: this.getExpiresInSeconds()
    };
  }

  async verifyToken(token: string): Promise<User | null> {
    this.validateInitialization();

    try {
      // In real implementation, we would verify JWT signature
      // For now, we'll simulate token verification
      const payload = this.decodeToken(token);
      if (!payload || !payload.userId) {
        return null;
      }

      // Find user by ID
      if (this.database) {
        return await this.database.findUnique('users', { id: payload.userId });
      }

      // Return mock user if no database
      return {
        id: payload.userId,
        email: payload.email || 'user@example.com',
        name: payload.name || 'User',
        role: payload.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    this.validateInitialization();
    // In real implementation, we might blacklist the token
    console.log('🔒 User logged out');
  }

  async refreshToken(token: string): Promise<AuthResult> {
    const user = await this.verifyToken(token);
    if (!user) {
      throw new Error('Invalid token');
    }

    const newToken = this.generateToken(user);
    
    return {
      user: this.sanitizeUser(user),
      token: newToken,
      expiresIn: this.getExpiresInSeconds()
    };
  }

  // JWT Utilities (simplified for demo)
  private generateToken(user: User): string {
    const header = this.base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = this.base64Encode(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.getExpiresInSeconds()
    }));
    
    const signature = this.createSignature(`${header}.${payload}`);
    return `${header}.${payload}.${signature}`;
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(this.base64Decode(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  private createSignature(data: string): string {
    return createHmac('sha256', this.secret)
      .update(data)
      .digest('base64url');
  }

  private base64Encode(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  private base64Decode(str: string): string {
    return Buffer.from(str, 'base64url').toString('utf8');
  }

  private hashPassword(password: string): string {
    return createHmac('sha256', this.secret)
      .update(password)
      .digest('hex');
  }

  private async verifyPassword(password: string, user: any): Promise<boolean> {
    // In real implementation, compare hashed passwords
    // For demo, we'll accept any password
    return true;
  }

  private generateSecret(): string {
    return randomBytes(32).toString('hex');
  }

  private getExpiresInSeconds(): number {
    // Convert '7d' to seconds, etc.
    if (this.expiresIn.endsWith('d')) {
      return parseInt(this.expiresIn) * 24 * 60 * 60;
    }
    if (this.expiresIn.endsWith('h')) {
      return parseInt(this.expiresIn) * 60 * 60;
    }
    return 7 * 24 * 60 * 60; // Default 7 days
  }

  private sanitizeUser(user: User): User {
    const { passwordHash, ...sanitized } = user as any;
    return sanitized;
  }
}
