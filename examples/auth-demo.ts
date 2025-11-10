/**
 * Auth Feature Demo - Complete Authentication System
 */

import zeroapi from '../index.js';

const app = zeroapi()
  .configure({ appName: 'ZeroAPI Auth Demo' })
  .database({ provider: 'sqlite' })
  .auth({
    provider: 'jwt',
    secret: 'your-super-secret-key-here', // In production, use env var
    expiresIn: '1h'
  });

// Auth middleware
app.use(async (req, res, next) => {
  // Skip auth for public routes
  if (req.url?.startsWith('/api/auth/')) {
    return next();
  }

  // Check for token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify token
  const user = await req.context.auth.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Add user to request context
  req.context.user = user;
  next();
});

// Public routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await req.context.auth.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await req.context.auth.login(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const result = await req.context.auth.refreshToken(token);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Protected routes
app.get('/api/profile', async (req, res) => {
  res.json({ 
    user: req.context.user,
    message: 'This is a protected route!'
  });
});

app.get('/api/users', async (req, res) => {
  // Only allow admins
  if (req.context.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = await req.context.db.findMany('users');
  res.json(users);
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI Auth Demo Running!');
  console.log('🔐 Authentication: JWT with database storage');
  console.log('');
  console.log('📍 Public Endpoints:');
  console.log('   POST http://localhost:3000/api/auth/register');
  console.log('   POST http://localhost:3000/api/auth/login');
  console.log('   POST http://localhost:3000/api/auth/refresh');
  console.log('');
  console.log('📍 Protected Endpoints (need token):');
  console.log('   GET  http://localhost:3000/api/profile');
  console.log('   GET  http://localhost:3000/api/users (admin only)');
  console.log('');
  console.log('💡 Try:');
  console.log('   http POST http://localhost:3000/api/auth/register email=test@example.com password=123456 name=TestUser');
  console.log('   http POST http://localhost:3000/api/auth/login email=test@example.com password=123456');
  console.log('   http GET http://localhost:3000/api/profile "Authorization: Bearer <token>"');
});
