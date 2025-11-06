const { URL } = require('url');

class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  pathToRegex(path) {
    const pattern = path.replace(/:\w+/g, '([^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  getParamNames(path) {
    return (path.match(/:\w+/g) || []).map(name => name.slice(1));
  }

  parseQuery(urlString) {
    try {
      const parsed = new URL(urlString, 'http://localhost');
      const query = {};
      parsed.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      return query;
    } catch {
      return {};
    }
  }

  find(method, urlPath) {
    for (const route of this.routes) {
      if (route.method === method) {
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
          if (route.path === urlPath) {
            return route;
          }
        }
      }
    }
    return null;
  }
}

module.exports = Router;
