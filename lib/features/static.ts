import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

export function serveStatic(staticDir: string) {
  console.log(`📁 Static file server initialized for: ${staticDir}`);
  
  return (req: any, res: any, next: any) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }

    let filePath = req.path;
    
    // Handle root path
    if (filePath === '/') {
      filePath = '/index.html';
    }

    // Remove leading slash
    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = join(process.cwd(), staticDir, relativePath);

    console.log(`📁 Static request: ${req.path} -> ${fullPath}`);

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.log(`❌ Static file not found: ${fullPath}`);
      return next();
    }

    // Check if it's a file (not directory)
    try {
      const stats = statSync(fullPath);
      if (!stats.isFile()) {
        console.log(`❌ Not a file: ${fullPath}`);
        return next();
      }
    } catch (err) {
      console.log(`❌ Cannot access: ${fullPath}`, err);
      return next();
    }

    // Read and serve the file
    try {
      const content = readFileSync(fullPath);
      const ext = extname(fullPath);
      const mimeType = mimeTypes[ext] || 'text/plain';

      console.log(`✅ Serving: ${relativePath} (${mimeType})`);

      res.setHeader('Content-Type', mimeType);
      
      // Send as string for text files, buffer for binary
      if (mimeType.startsWith('text/') || mimeType.includes('javascript') || mimeType.includes('json')) {
        res.send(content.toString('utf8'));
      } else {
        res.send(content);
      }
    } catch (error) {
      console.log(`❌ Error serving ${fullPath}:`, error);
      next();
    }
  };
}
