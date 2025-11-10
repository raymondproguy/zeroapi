/**
 * ZeroAPI v2 Demo - Clean Architecture
 */

import zeroapi from '../index.js';

const app = zeroapi()
  .configure({ appName: 'ZeroAPI v2 Demo' })
  .database({ provider: 'sqlite' })
  .auth();

// Demo routes showing clean architecture
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    features: Object.keys(req.context),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', async (req, res) => {
  const users = await req.context.db.findMany('users');
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await req.context.db.create('users', req.body);
  res.status(201).json(user);
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI v2 Demo Running!');
  console.log('📍 http://localhost:3000/api/health');
  console.log('📍 http://localhost:3000/api/users');
  console.log('');
  console.log('🏗️  Architecture:');
  console.log('   ✅ Clean separation of concerns');
  console.log('   ✅ Feature-based architecture');
  console.log('   ✅ Type-safe throughout');
  console.log('   ✅ Professional structure');
});
