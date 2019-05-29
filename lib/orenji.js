const EventEmitter = require('events');
const http = require('http');
const Context = require('./utils/classes/Context');

module.exports = class Orenji extends EventEmitter {
  constructor() {
    super();

    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 3000;
    this.middleware = [];
  }

  listen(...args) {
    const server = http.createServer();
    return server.listen(this.port, ...args);
  }

  use(fn) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware must be a function');
    this.middleware.push(fn);
  }

  createContext(req, res) {
    const context = new Context();
    context.app = this;
    context.req = req;
    context.res = res;
    context.state = {};
    return context;
  }
};
