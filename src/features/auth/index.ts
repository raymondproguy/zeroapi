/**
 * Auth Feature Exports
 */

export { Auth } from './auth.js';
export { JWTProvider } from './providers/jwt.js';
export { FirebaseProvider } from './providers/firebase.js';
export type { 
  AuthOptions, 
  User, 
  AuthResult, 
  LoginCredentials, 
  RegisterData 
} from './types.js';
