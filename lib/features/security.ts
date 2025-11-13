import zeroapi from './index.js';

const app = zeroapi()
  // === TEST SECURITY HEADERS ===
  .useSecurityHeaders({
    frameguard: 'SAMEORIGIN',
    enableCSP: true
  })
  .static('website')
  .use((req: any, res: any, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
  });

app.get('/api/hello', (req: any, res: any) => {
  res.json({ 
    message: 'Hello with security headers!',
    headers: 'Check your browser dev tools -> Network -> Response Headers'
  });
});

app.listen(3000, () => {
  console.log('🚀 Server with Security Headers running!');
  console.log('📍 http://localhost:3000/api/hello');
  console.log('🔒 Security headers are now active!');
});
