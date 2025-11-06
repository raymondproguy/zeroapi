import createApp from './index';

const app = createApp();

// Test all features
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 ZeroAPI TypeScript Edition!',
    features: [
      'TypeScript Support',
      'JSON Body Parsing', 
      'Path Parameters',
      'Query Parameters',
      'Full Type Safety'
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/users/:id', (req, res) => {
  res.json({
    user_id: req.params.id,
    message: `User ${req.params.id} profile`
  });
});

app.get('/search', (req, res) => {
  res.json({
    query: req.query.q,
    limit: req.query.limit,
    all_queries: req.query
  });
});

app.post('/users', (req, res) => {
  res.status(201).json({
    message: 'User created!',
    received_data: req.body,
    id: Math.random().toString(36).substr(2, 9)
  });
});

app.put('/users/:id', (req, res) => {
  res.json({
    message: `User ${req.params.id} updated!`,
    update_data: req.body
  });
});

app.delete('/users/:id', (req, res) => {
  res.json({
    message: `User ${req.params.id} deleted`
  });
});

app.listen(3000, () => {
  console.log('🔥 ZeroAPI TypeScript Server Running!');
  console.log('📍 http://localhost:3000');
  console.log('📝 TypeScript checking enabled - no more runtime bugs!');
});
