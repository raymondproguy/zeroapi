import zeroapi from './index.js';

const app = zeroapi();

// 🆕 Serve static files from /website directory
app.static('website');

// 🆕 Global middleware - logs all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// =======================
// 🚀 API ROUTES
// =======================

// Basic API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Welcome to ZeroAPI! 🚀',
    features: ['Static File Serving', 'Middleware', 'TypeScript'],
    timestamp: new Date().toISOString()
  });
});

// Path parameters
app.get('/api/users/:id', (req, res) => {
  res.json({
    user_id: req.params.id,
    name: `User ${req.params.id}`,
    profile_url: `https://example.com/users/${req.params.id}`
  });
});

// Query parameters
app.get('/api/search', (req, res) => {
  res.json({
    query: req.query.q,
    results: [
      `Result 1 for ${req.query.q}`,
      `Result 2 for ${req.query.q}`,
      `Result 3 for ${req.query.q}`
    ],
    total: 3
  });
});

// POST with JSON body
app.post('/api/users', (req, res) => {
  res.status(201).json({
    message: 'User created!',
    user_data: req.body,
    id: Math.random().toString(36).substr(2, 9)
  });
});

// Auth protected route (mock)
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = { id: 123, name: 'Demo User' };
  next();
};

app.get('/api/profile', authMiddleware, (req: any, res) => {
  res.json({
    message: 'Protected profile data',
    user: req.user,
    secret_data: 'This is protected information!'
  });
});

// Start server
app.listen(3000, () => {
  console.log('🚀 ZeroAPI Milestone 3 Running!');
  console.log('🌐 Website: http://localhost:3000');
  console.log('🔗 API Demo: http://localhost:3000/api/hello');
  console.log('📁 Static files served from /website');
  console.log('');
  console.log('✨ Features included:');
  console.log('   ✅ Static file serving');
  console.log('   ✅ Middleware system');
  console.log('   ✅ Path parameters');
  console.log('   ✅ Query parameters');
  console.log('   ✅ JSON body parsing');
  console.log('   ✅ CORS handling');
  console.log('   ✅ TypeScript support');
});
