const http = require('http');
const Router = require('./Router');
const Request = require('./Request');
const Response = require('./Response');

class ZeroAPI {
  constructor() {
    this.router = new Router();
  }

  get(path, handler) {
    this.router.add('GET', path, handler);
    return this;
  }

  post(path, handler) {
    this.router.add('POST', path, handler);
    return this;
  }

  put(path, handler) {
    this.router.add('PUT', path, handler);
    return this;
  }

  delete(path, handler) {
    this.router.add('DELETE', path, handler);
    return this;
  }

  setupCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  async parseBody(req) {
    return new Promise((resolve) => {
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (error) {
            resolve({});
          }
        });
      } else {
        resolve({});
      }
    });
  }

  listen(port, callback) {
    const server = http.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });

    server.listen(port, callback);
    return this;
  }

  async handleRequest(req, res) {
    this.setupCORS(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(200).end();
      return;
    }

    const body = await this.parseBody(req);
    const urlPath = req.url.split('?')[0];
    const route = this.router.find(req.method, urlPath);

    if (route) {
      const request = new Request(req, route.params, this.router.parseQuery(req.url), body);
      const response = new Response(res);

      try {
        route.handler(request, response);
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Route not found' }));
    }
  }
}

module.exports = ZeroAPI;
