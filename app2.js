const zeroAPI = require('./index2');
const app = zeroAPI();

// =======================
// DEMO ROUTES - TEST ALL FEATURES
// =======================

// 1. Basic GET route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 ZeroAPI is working!',
    features: [
      'JSON Body Parsing',
      'Path Parameters', 
      'Query Parameters',
      'CORS Enabled',
      'RESTful Methods'
    ],
    timestamp: new Date().toISOString()
  });
});

// 2. Path parameters
app.get('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: `User profile for ID: ${req.params.id}`,
    user_id: req.params.id,
    path_parameters: req.params
  });
});

// 3. Multiple path parameters
app.get('/posts/:postId/comments/:commentId', (req, res) => {
  res.json({
    success: true,
    post_id: req.params.postId,
    comment_id: req.params.commentId,
    all_path_params: req.params
  });
});

// 4. Query parameters
app.get('/search', (req, res) => {
  res.json({
    success: true,
    search_query: req.query.q,
    limit: req.query.limit || 10,
    page: req.query.page || 1,
    all_query_params: req.query
  });
});

// 5. Combined path + query parameters
app.get('/products/:id/reviews', (req, res) => {
  res.json({
    success: true,
    product_id: req.params.id,
    sort_by: req.query.sort || 'newest',
    rating_filter: req.query.rating,
    page: req.query.page || 1,
    path_params: req.params,
    query_params: req.query
  });
});

// 6. POST with JSON body parsing
app.post('/users', (req, res) => {
  console.log('📦 Received POST data:', req.body);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully!',
    received_data: req.body,
    generated_id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  });
});

// 7. PUT with JSON body parsing
app.put('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: `User ${req.params.id} updated!`,
    user_id: req.params.id,
    update_data: req.body,
    timestamp: new Date().toISOString()
  });
});

// 8. DELETE route
app.delete('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: `User ${req.params.id} deleted`,
    user_id: req.params.id,
    timestamp: new Date().toISOString()
  });
});

// 9. Complex POST with nested JSON
app.post('/orders', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Order created!',
    order_data: req.body,
    order_id: `ORD-${Date.now()}`,
    estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log('🔥 ZEROAPI SERVER RUNNING!');
  console.log('📍 http://localhost:3000');
  console.log('');
  console.log('📋 TEST ALL FEATURES:');
  console.log('');
  console.log('🔹 BASIC ROUTES:');
  console.log('   http GET http://localhost:3000/');
  console.log('   http GET http://localhost:3000/users/123');
  console.log('   http GET http://localhost:3000/posts/456/comments/789');
  console.log('');
  console.log('🔹 QUERY PARAMETERS:');
  console.log('   http GET "http://localhost:3000/search?q=javascript&limit=5&page=2"');
  console.log('   http GET "http://localhost:3000/products/999/reviews?sort=rating&page=1"');
  console.log('');
  console.log('🔹 JSON BODY PARSING (POST/PUT):');
  console.log('   http POST http://localhost:3000/users name="Alice" email="alice@test.com" age=25');
  console.log('   http PUT http://localhost:3000/users/123 name="Bob" email="bob@test.com"');
  console.log('   http POST http://localhost:3000/orders items:=\'[{"id":1,"qty":2}]\' customer:=\'{"name":"John"}\'');
  console.log('');
  console.log('🔹 DELETE:');
  console.log('   http DELETE http://localhost:3000/users/456');
  console.log('');
  console.log('✅ All features working: Path Params, Query Params, JSON Body, CORS!');
});
