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

  // Simple route matching
  findRoute(method, url) {
    return this.routes.find(route => {
      return route.method === method && route.path === url;
    });
  }

  // Start the server
  listen(port, callback) {
    const server = require('http').createServer((req, res) => {
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

      // Find matching route
      const route = this.findRoute(req.method, req.url);
      
      if (route) {
        // Set JSON header
        res.setHeader('Content-Type', 'application/json');
        
        // Simple request object
        const request = {
          method: req.method,
          url: req.url,
          headers: req.headers
        };

        // Simple response object
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
