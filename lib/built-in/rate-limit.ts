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
    windowMs: 60000, // 1 minute window
    max: 5,          // Max 5 requests per minute
    message: 'Too many requests from this IP, please try again in a minute.'
  })
  .static('website')
  .use((req: any, res: any, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
  });

app.get('/api/hello', (req: any, res: any) => {
  res.json({ 
    message: 'Hello with security, compression, and rate limiting!',
    timestamp: new Date().toISOString(),
    requestCount: 'Check X-RateLimit headers'
  });
});

app.get('/api/unlimited', (req: any, res: any) => {
  res.json({ 
    message: 'This endpoint has no rate limiting',
    note: 'Rate limiting is applied per-route in the future'
  });
});

app.listen(3000, () => {
  console.log('🚀 Server with Security, Compression & Rate Limiting running!');
  console.log('📍 http://localhost:3000/api/hello');
  console.log('🔒 Security active | 🗜️ Compression active | ⏱️ Rate limiting active (5 req/min)');
  console.log('');
  console.log('🧪 Test rate limiting:');
  console.log('   for i in {1..6}; do curl http://localhost:3000/api/hello; done');
  console.log('   The 6th request should return 429 Too Many Requests');
});
