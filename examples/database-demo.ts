/**
 * Database Feature Demo - Showcasing Real Database Operations
 */

import zeroapi from '../index.js';

const app = zeroapi()
  .configure({ appName: 'ZeroAPI Database Demo' })
  .database({
    provider: 'sqlite' // Try: 'sqlite', 'postgresql', 'mongodb'
  });

// Real database operations
app.get('/api/users', async (req, res) => {
  const users = await req.context.db.findMany('users', {
    where: { active: true },
    limit: 10
  });
  res.json(users);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await req.context.db.findUnique('users', { id: req.params.id });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const user = await req.context.db.create('users', {
    name: req.body.name,
    email: req.body.email,
    active: true
  });
  res.status(201).json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const user = await req.context.db.update('users', 
    { id: req.params.id }, 
    { name: req.body.name, email: req.body.email }
  );
  res.json(user);
});

app.delete('/api/users/:id', async (req, res) => {
  await req.context.db.delete('users', { id: req.params.id });
  res.status(204).send();
});

app.get('/api/stats', async (req, res) => {
  const totalUsers = await req.context.db.count('users');
  const activeUsers = await req.context.db.count('users', { active: true });
  
  res.json({
    totalUsers,
    activeUsers,
    database: req.context.db.getProviderName(),
    connected: req.context.db.isConnected()
  });
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI Database Demo Running!');
  console.log('🗃️  Database Provider: SQLite (in-memory)');
  console.log('');
  console.log('📍 Endpoints:');
  console.log('   GET  http://localhost:3000/api/users');
  console.log('   POST http://localhost:3000/api/users');
  console.log('   GET  http://localhost:3000/api/users/:id');
  console.log('   PUT  http://localhost:3000/api/users/:id');
  console.log('   DEL  http://localhost:3000/api/users/:id');
  console.log('   GET  http://localhost:3000/api/stats');
  console.log('');
  console.log('💡 Try:');
  console.log('   http POST http://localhost:3000/api/users name=John email=john@example.com');
  console.log('   http GET http://localhost:3000/api/users');
});
