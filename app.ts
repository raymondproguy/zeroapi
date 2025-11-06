import zeroapi from './index.js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const app = zeroapi();

// Check website files
app.get('/check-files', async (req, res) => {
  const { readdirSync, existsSync } = await import('fs');
  const { join } = await import('path');
  
  const websitePath = join(process.cwd(), 'website');
  const files = readdirSync(websitePath);
  
  const fileDetails = files.map(file => {
    const fullPath = join(websitePath, file);
    return {
      name: file,
      path: fullPath,
      exists: existsSync(fullPath),
      webPath: `/${file}`
    };
  });
  
  res.json({
    current_directory: process.cwd(),
    website_path: websitePath,
    files: fileDetails
  });
});

// Debug route to check static file serving
/*
app.get('/debug', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const websitePath = path.join(process.cwd(), 'website');
  const files = fs.readdirSync(websitePath);
  
  res.json({
    current_directory: process.cwd(),
    website_path: websitePath,
    files_in_website: files,
    exists: fs.existsSync(websitePath)
  });
});
*/

// 🆕 Serve static files from /website directory
app.static('website');

// 🆕 Global middleware - logs all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Debug route to check static file serving
app.get('/debug', (req, res) => {
  const websitePath = join(process.cwd(), 'website');
  let files: string[] = [];
  let exists = false;
  
  try {
    exists = existsSync(websitePath);
    if (exists) {
      files = readdirSync(websitePath);
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  res.json({
    current_directory: process.cwd(),
    website_path: websitePath,
    files_in_website: files,
    exists: exists,
    static_configured: true
  });
});

// Direct route for root to test
app.get('/', (req, res) => {
  const websiteIndex = join(process.cwd(), 'website', 'index.html');
  
  try {
    if (existsSync(websiteIndex)) {
      const html = readFileSync(websiteIndex, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.json({ 
        error: 'Website file not found',
        path: websiteIndex,
        current_dir: process.cwd(),
        files_in_website: readdirSync(join(process.cwd(), 'website'))
      });
    }
  } catch (error) {
    res.json({
      error: 'Failed to serve website',
      details: error.message,
      websiteIndex: websiteIndex,
      exists: existsSync(websiteIndex)
    });
  }
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
