import zeroapi, { NotFoundError, ValidationError, UnauthorizedError } from './index.js';

const app = zeroapi();

// Serve static files
app.static('website');

// Global middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// 🆕 DEMO ERROR HANDLING ROUTES

// 1. 404 - Not Found Error
app.get('/api/users/:id', (req, res) => {
  // Simulate user not found
  if (req.params.id === '999') {
    throw new NotFoundError(`User ${req.params.id} not found`, {
      userId: req.params.id,
      suggestion: 'Check if the user ID is correct'
    });
  }
  
  res.json({
    id: req.params.id,
    name: `User ${req.params.id}`,
    email: `user${req.params.id}@example.com`
  });
});

// 2. 400 - Validation Error
app.post('/api/users', (req, res) => {
  if (!req.body.email) {
    throw new ValidationError('Email is required', {
      field: 'email',
      rule: 'required'
    });
  }
  
  if (!req.body.name || req.body.name.length < 2) {
    throw new ValidationError('Name must be at least 2 characters', {
      field: 'name',
      rule: 'minLength',
      min: 2
    });
  }

  res.status(201).json({
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    createdAt: new Date().toISOString()
  });
});

// 3. 401 - Unauthorized Error
app.get('/api/admin', (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    throw new UnauthorizedError('Authentication required', {
      hint: 'Include Authorization header with valid token'
    });
  }
  
  res.json({
    message: 'Welcome to admin area!',
    secretData: ['user_stats', 'system_health']
  });
});

// 4. Generic error (500)
app.get('/api/error', (req, res) => {
  // This will be caught by the generic error handler
  throw new Error('This is a generic error');
});

// Existing working routes
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Welcome to ZeroAPI with Error Handling! 🚀',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/search', (req, res) => {
  res.json({
    query: req.query.q,
    results: [`Result for ${req.query.q}`]
  });
});

// 🆕 Custom error handler (optional)
app.onError((error, req, res) => {
  console.log('🔧 Custom error handler triggered:', error.message);
  
  res.status(error.statusCode || 500).json({
    error: error.message,
    details: error.details,
    timestamp: new Date().toISOString(),
    path: req.url
  });
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI with Error Handling Running!');
  console.log('📍 http://localhost:3000');
  console.log('');
  console.log('🧪 Test Error Handling:');
  console.log('   http GET http://localhost:3000/api/users/999          # 404');
  console.log('   http POST http://localhost:3000/api/users             # 400 (no email)');
  console.log('   http GET http://localhost:3000/api/admin              # 401');
  console.log('   http GET http://localhost:3000/api/error              # 500');
  console.log('');
  console.log('✅ Working routes:');
  console.log('   http GET http://localhost:3000/api/hello              # 200');
  console.log('   http GET http://localhost:3000/api/users/123          # 200');
});
