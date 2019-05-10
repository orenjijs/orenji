const Context = require('./utils/classes/Context');

module.exports = class Orenji {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 3000;
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
