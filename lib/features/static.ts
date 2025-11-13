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
  console.log(`📁 Static file server ready: ${staticDir}/`);
  
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

    // Check if file exists and is a file (not directory)
    if (!existsSync(fullPath)) {
      return next();
    }

    try {
      const stats = statSync(fullPath);
      if (!stats.isFile()) {
        return next();
      }
    } catch (err) {
      return next();
    }

    // Read and serve the file
    try {
      const content = readFileSync(fullPath);
      const ext = extname(fullPath);
      const mimeType = mimeTypes[ext] || 'text/plain';

      res.setHeader('Content-Type', mimeType);
      
      // Send as string for text files, buffer for binary
      if (mimeType.startsWith('text/') || mimeType.includes('javascript') || mimeType.includes('json')) {
        res.send(content.toString('utf8'));
      } else {
        res.send(content);
      }
    } catch (error) {
      next();
    }
  };
}
