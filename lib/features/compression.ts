import zeroapi from './index.js';

const app = zeroapi()
  // === SECURITY HEADERS ===
  .useSecurityHeaders({
    frameguard: 'SAMEORIGIN',
    enableCSP: true
  })
  // === COMPRESSION ===
  .useCompression({
    threshold: 500, // Compress responses larger than 500 bytes
    level: 6        // Compression level (1-9)
  })
  .static('website')
  .use((req: any, res: any, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
  });

app.get('/api/hello', (req: any, res: any) => {
  res.json({ 
    message: 'Hello with security headers and compression!',
    description: 'This response should be compressed if Accept-Encoding includes gzip or deflate',
    largeData: 'x'.repeat(1000) // Make response large enough to compress
  });
});

app.get('/api/small', (req: any, res: any) => {
  res.json({ 
    message: 'This is too small to compress',
    size: 'Only a few bytes'
  });
});

app.listen(3000, () => {
  console.log('🚀 Server with Security Headers & Compression running!');
  console.log('📍 http://localhost:3000/api/hello');
  console.log('📍 http://localhost:3000/api/small');
  console.log('🔒 Security headers active | 🗜️ Compression active');
});
