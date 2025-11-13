/**
 * Comprehensive Swagger Documentation Example
 */

import zeroapi, { Doc, DocBuilder } from './index.js';

// Create app with all features
const app = zeroapi()
  // === BASIC FEATURES ===
  .useSecurityHeaders()
  .useCompression()
  .useRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
  // === SWAGGER DOCUMENTATION ===
  .swagger({
    title: 'ZeroAPI Demo API',
    version: '1.0.0',
    description: 'A comprehensive demo API built with ZeroAPI framework',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development server' },
      { url: 'https://api.example.com', description: 'Production server' }
    ]
  })
  // === DEVELOPMENT FEATURES ===
  .enableHotReload();

// User routes with documentation
app.get('/api/users', 
  /**
   * Get all users
   */
  (req: any, res: any) => {
    res.json({
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
      ],
      total: 3,
      page: 1,
      limit: 10
    });
  }
);

app.get('/api/users/:id',
  /**
   * Get user by ID
   */
  (req: any, res: any) => {
    const userId = req.params.id;
    
    if (userId === '999') {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${userId} does not exist`
      });
    }

    res.json({
      id: parseInt(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
);

app.post('/api/users',
  /**
   * Create a new user
   */
  (req: any, res: any) => {
    const { name, email, role = 'user' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name and email are required',
        details: {
          name: !name ? 'Name is required' : undefined,
          email: !email ? 'Email is required' : undefined
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid email format'
      });
    }

    const newUser = {
      id: Math.floor(Math.random() * 1000) + 100,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(newUser);
  }
);

app.put('/api/users/:id',
  /**
   * Update user by ID
   */
  (req: any, res: any) => {
    const userId = req.params.id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No update data provided'
      });
    }

    res.json({
      id: parseInt(userId),
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }
);

app.delete('/api/users/:id',
  /**
   * Delete user by ID
   */
  (req: any, res: any) => {
    const userId = req.params.id;

    res.json({
      message: `User ${userId} deleted successfully`,
      deletedAt: new Date().toISOString()
    });
  }
);

// Product routes
app.get('/api/products', (req: any, res: any) => {
  const { category, inStock } = req.query;

  let products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', inStock: true },
    { id: 2, name: 'Book', price: 19.99, category: 'education', inStock: true },
    { id: 3, name: 'Headphones', price: 149.99, category: 'electronics', inStock: false }
  ];

  // Filter products if query parameters provided
  if (category) {
    products = products.filter(p => p.category === category);
  }

  if (inStock !== undefined) {
    const stockFilter = inStock === 'true';
    products = products.filter(p => p.inStock === stockFilter);
  }

  res.json({
    products,
    filters: { category, inStock },
    total: products.length
  });
});

app.get('/api/products/:id', (req: any, res: any) => {
  const productId = req.params.id;

  res.json({
    id: parseInt(productId),
    name: `Product ${productId}`,
    price: 99.99,
    category: 'general',
    description: 'A wonderful product',
    inStock: true,
    tags: ['featured', 'new']
  });
});

// Health check endpoint
app.get('/api/health', (req: any, res: any) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(3000, () => {
  console.log('🚀 ZeroAPI with Swagger Documentation running!');
  console.log('');
  console.log('📍 API Endpoints:');
  console.log('   http://localhost:3000/api/users');
  console.log('   http://localhost:3000/api/products');
  console.log('   http://localhost:3000/api/health');
  console.log('');
  console.log('📚 Swagger Documentation:');
  console.log('   http://localhost:3000/api-docs');
  console.log('   http://localhost:3000/api-docs/json');
  console.log('');
  console.log('🎯 Features active:');
  console.log('   ✅ Security Headers');
  console.log('   ✅ Compression');
  console.log('   ✅ Rate Limiting');
  console.log('   ✅ Swagger Documentation');
  console.log('   ✅ Hot Reload (development)');
  console.log('');
  console.log('💡 Try the Swagger UI to explore and test all API endpoints!');
});
