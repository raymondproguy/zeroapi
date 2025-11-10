/**
 * Storage Feature Demo - File Uploads Made Easy
 */

import zeroapi from '../index.js';

const app = zeroapi()
  .configure({ appName: 'ZeroAPI Storage Demo' })
  .database({ provider: 'sqlite' })
  .auth({ provider: 'jwt', secret: 'demo-secret' })
  .storage({ 
    provider: 'local' // Try: 'local', 's3', 'cloudinary'
  });

// File upload middleware
app.use(async (req, res, next) => {
  // Simulate file parsing (in real app, use multer or similar)
  if (req.method === 'POST' && req.headers['content-type']?.includes('multipart')) {
    // Mock file data - in real implementation, parse multipart form
    req.files = [{
      originalname: 'demo.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('mock file content'),
      size: 1024
    }];
  }
  next();
});

// File upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadResults = [];
    
    for (const file of req.files) {
      const result = await req.context.storage.upload(file, {
        folder: 'uploads'
      });
      uploadResults.push(result);
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadResults
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get file URL
app.get('/api/files/:key/url', async (req, res) => {
  try {
    const url = await req.context.storage.getUrl(req.params.key);
    res.json({ url });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// List files
app.get('/api/files', async (req, res) => {
  try {
    const files = await req.context.storage.listFiles(req.query.prefix as string);
    res.json({ files });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete file
app.delete('/api/files/:key', async (req, res) => {
  try {
    await req.context.storage.delete(req.params.key);
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected upload (requires auth)
app.post('/api/secure/upload', async (req, res) => {
  // Check authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await req.context.auth.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Proceed with upload
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const result = await req.context.storage.upload(req.files[0], {
    folder: `users/${user.id}`
  });

  res.json({
    message: 'File uploaded securely',
    file: result,
    user: { id: user.id, email: user.email }
  });
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI Storage Demo Running!');
  console.log('📁 Storage Provider: Local filesystem');
  console.log('');
  console.log('📍 Endpoints:');
  console.log('   POST http://localhost:3000/api/upload');
  console.log('   GET  http://localhost:3000/api/files/:key/url');
  console.log('   GET  http://localhost:3000/api/files');
  console.log('   DEL  http://localhost:3000/api/files/:key');
  console.log('   POST http://localhost:3000/api/secure/upload (protected)');
  console.log('');
  console.log('💡 Features:');
  console.log('   ✅ File upload with validation');
  console.log('   ✅ Multiple storage providers');
  console.log('   ✅ File listing and deletion');
  console.log('   ✅ Secure uploads with user folders');
  console.log('   ✅ File type and size validation');
});
