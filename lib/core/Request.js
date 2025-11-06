lass Request {
  constructor(req, routeParams, queryParams, body = {}) {
    this.method = req.method;
    this.url = req.url;
    this.path = req.url.split('?')[0];
    this.headers = req.headers;
    this.params = routeParams || {};
    this.query = queryParams || {};
    this.body = body;
  }
}

module.exports = Request;
