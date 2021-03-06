const EventEmitter = require('events');
const http = require('http');
const util = require('util');
const Context = require('./utils/classes/Context');
const compose = require('./utils/functions/compose');
const respond = require('./utils/functions/respond');

module.exports = class Orenji extends EventEmitter {
  constructor() {
    super();

    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 3000;
    this.middleware = [];
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(this.port, ...args);
  }

  use(fn) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware must be a function');
    this.middleware.push(fn);
  }

  callback() {
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };
    return handleRequest;
  }

  createContext(req, res) {
    const context = new Context();
    context.app = this;
    context.req = req;
    context.res = res;
    context.state = {};
    return context;
  }

  handleRequest(ctx, fn) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    return fn(ctx)
      .then(handleResponse)
      .catch(onerror);
  }

  onerror(err) {
    if (!(err instanceof Error))
      throw new TypeError(util.format('non-error thrown %j', err));

    if (err.status === 404 || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
};
