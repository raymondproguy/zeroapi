const http = require('http');
const url = require('url');

class ZeroAPI {
  constructor() {
    this.routes = [];
    this.middlewares = [];
  }

  // Store routes with method, path, and handler
  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
  }

  put(path, handler) {
    this.routes.push({ method: 'PUT', path, handler });
  }

  delete(path, handler) {
    this.routes.push({ method: 'DELETE', path, handler });
  }

  // Convert path like '/users/:id' to regex
  pathToRegex(path) {
    const pattern = path.replace(/:\w+/g, '([^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  // Extract parameter names from path
  getParamNames(path) {
    return (path.match(/:\w+/g) || []).map(name => name.slice(1));
  }

  // Parse query parameters from URL
  parseQuery(urlString) {
    const parsed = url.parse(urlString, true);
    return parsed.query || {};
  }

  // Enhanced route matching with path parameters
  findRoute(method, urlPath) {
    for (const route of this.routes) {
      if (route.method === method) {
        // Check if it's a path parameter route (contains :)
        if (route.path.includes(':')) {
          const pattern = this.pathToRegex(route.path);
          const match = urlPath.match(pattern);
          
          if (match) {
            const paramNames = this.getParamNames(route.path);
            const params = {};
            
            paramNames.forEach((name, index) => {
              params[name] = match[index + 1];
            });
            
            return { ...route, params };
          }
        } else {
          // Exact match for normal routes
          if (route.path === urlPath) {
            return route;
          }
        }
      }
    }
    return null;
  }

  // Start the server
  listen(port, callback) {
    const server = http.createServer((req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Extract path without query string for routing
      const urlPath = req.url.split('?')[0];
      
      // Find matching route
      const route = this.findRoute(req.method, urlPath);

      if (route) {
        // Set JSON header
        res.setHeader('Content-Type', 'application/json');

        // Enhanced request object with params and query!
        const request = {
          method: req.method,
          url: req.url,
          path: urlPath,
          headers: req.headers,
          params: route.params || {},      // 🆕 Path parameters
          query: this.parseQuery(req.url)  // 🆕 Query parameters
        };

        // Response object
        const response = {
          status: (code) => {
            res.writeHead(code);
            return response;
          },
          json: (data) => {
            res.end(JSON.stringify(data));
          }
        };

        // Call the route handler
        route.handler(request, response);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
      }
    });

    server.listen(port, callback);
  }
}

module.exports = function createApp() {
  return new ZeroAPI();
};
