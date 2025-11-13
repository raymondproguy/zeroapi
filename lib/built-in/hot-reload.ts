import zeroapi from './index.js';

const app = zeroapi()
  // === SECURITY HEADERS ===
  .useSecurityHeaders({
    frameguard: 'SAMEORIGIN',
    enableCSP: true
  })
  // === COMPRESSION ===
  .useCompression({
    threshold: 500,
    level: 6
  })
  // === RATE LIMITING ===
  .useRateLimit({
    windowMs: 60000,
    max: 5,
    message: 'Too many requests from this IP, please try again in a minute.'
  })
  // === HOT RELOAD === (Only in development)
  .enableHotReload({
    watchDirs: ['./routes', './lib', './middleware'], // Watch these directories
    extensions: ['.ts', '.js', '.json'], // Watch these file types
    delay: 500 // Wait 500ms after changes before restarting
  })
  .static('website')
  .use((req: any, res: any, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
  });

// Demo routes
app.get('/api/hello', (req: any, res: any) => {
  res.json({ 
    message: 'Hello with hot reload!',
    timestamp: new Date().toISOString(),
    features: ['security', 'compression', 'rate-limiting', 'hot-reload']
  });
});

app.get('/api/info', (req: any, res: any) => {
  res.json({ 
    environment: process.env.NODE_ENV || 'development',
    hotReload: process.env.NODE_ENV === 'development' ? 'active' : 'inactive',
    nodeVersion: process.version
  });
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI with Hot Reload running!');
  console.log('📍 http://localhost:3000/api/hello');
  console.log('📍 http://localhost:3000/api/info');
  console.log('');
  console.log("Test hot reload!");
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 HOT RELOAD ACTIVATED!');
    console.log('💡 Try making changes to app.ts and watch the server restart automatically!');
    console.log('   - Change a route response');
    console.log('   - Add a new route');
    console.log('   - Modify existing code');
    console.log('');
  }
});
