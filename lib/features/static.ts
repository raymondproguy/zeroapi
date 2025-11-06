import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

export function serveStatic(staticPath: string) {
  return (req: any, res: any, next: any) => {
    if (req.method !== 'GET') return next();
    
    let filePath = req.path;
    if (filePath === '/') filePath = '/index.html';
    
    const fullPath = join(process.cwd(), staticPath, filePath);
    
    if (!existsSync(fullPath)) {
      return next();
    }
    
    try {
      const content = readFileSync(fullPath);
      const ext = extname(fullPath);
      const mimeType = mimeTypes[ext] || 'text/plain';
      
      res.setHeader('Content-Type', mimeType);
      res.send(content);
    } catch (error) {
      next();
    }
  };
}
