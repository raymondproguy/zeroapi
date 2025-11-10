/**
 * Authentication Type Definitions
 */

export interface AuthOptions {
  provider: 'jwt' | 'firebase' | 'auth0';
  secret?: string;
  expiresIn?: string;
  database?: any; // Database instance for user storage
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  token: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthProvider {
  name: string;
  initialize(): Promise<void>;
  register(userData: RegisterData): Promise<AuthResult>;
  login(credentials: LoginCredentials): Promise<AuthResult>;
  verifyToken(token: string): Promise<User | null>;
  logout(token: string): Promise<void>;
  refreshToken(token: string): Promise<AuthResult>;
}
