const zeroAPI = require('./zeroapi');
const app = zeroAPI();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from ZeroAPI! 🚀',
    features: ['Path Parameters', 'Query Parameters', 'CORS'],
    timestamp: new Date().toISOString()
  });
});

// 🆕 Path parameters - /users/123
app.get('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: `User ${req.params.id} details`,
    user_id: req.params.id,
    params: req.params  // Show all path parameters
  });
});

// 🆕 Multiple path parameters - /posts/456/comments/789
app.get('/posts/:postId/comments/:commentId', (req, res) => {
  res.json({
    success: true,
    post_id: req.params.postId,
    comment_id: req.params.commentId,
    all_params: req.params
  });
});

// 🆕 Query parameters - /search?q=javascript&limit=10
app.get('/search', (req, res) => {
  res.json({
    success: true,
    search_query: req.query.q,
    limit: req.query.limit,
    all_query_params: req.query
  });
});

// 🆕 Combined path + query parameters - /products/123/reviews?sort=rating&limit=5
app.get('/products/:productId/reviews', (req, res) => {
  res.json({
    success: true,
    product_id: req.params.productId,
    sort_by: req.query.sort,
    review_limit: req.query.limit,
    path_params: req.params,
    query_params: req.query
  });
});

// Regular routes still work
app.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  });
});

app.post('/users', (req, res) => {
  res.json({
    message: 'User created successfully!',
    success: true
  });
});

// Start server
app.listen(3000, () => {
  console.log('🔥 ZeroAPI with Path + Query Parameters Running!');
  console.log('📍 http://localhost:3000');
  console.log('');
  console.log('🚀 Test these exciting new endpoints:');
  console.log('   http GET http://localhost:3000/users/123');
  console.log('   http GET http://localhost:3000/posts/456/comments/789');
  console.log('   http GET "http://localhost:3000/search?q=javascript&limit=10"');
  console.log('   http GET "http://localhost:3000/products/123/reviews?sort=rating&limit=5"');
  console.log('   http GET http://localhost:3000/users');
  console.log('   http POST http://localhost:3000/users');
});
