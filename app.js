const zeroAPI = require('./zeroapi');

const app = zeroAPI();

// Our first REAL framework endpoint!
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Hello from ZeroAPI!',
    framework: true,
    timestamp: new Date().toISOString()
  });
});

// Another endpoint
app.get('/users', (req, res) => {
  res.status(200).json({
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]
  });
});

// POST endpoint
app.post('/users', (req, res) => {
  res.status(201).json({
    message: 'User created!',
    id: Math.random().toString(36).substr(2, 9)
  });
});

app.listen(3000, () => {
  console.log('🔥 ZeroAPI server running on http://localhost:3000');
  console.log('');
  console.log('Test endpoints:');
  console.log('  http GET http://localhost:3000');
  console.log('  http GET http://localhost:3000/users');
  console.log('  http POST http://localhost:3000/users');
});
