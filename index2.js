const ZeroAPI = require('./lib/core/zeroapi');

function createApp() {
  return new ZeroAPI();
}

module.exports = createApp;
