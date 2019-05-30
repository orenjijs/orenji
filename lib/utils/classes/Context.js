const util = require('util');
const getType = require('cache-content-type');
const statuses = require('statuses');

module.exports = class Context {
  get(field) {
    return this.headers[field.toLowerCase()] || '';
  }

  set(field, val) {
    if (this.res.headersSent) return;

    if (arguments.length === 2) {
      if (Array.isArray(val))
        val = val.map(v => (typeof v === 'string' ? v : String(v)));
      else if (typeof val !== 'string') val = String(val);
      this.res.setHeader(field, val);
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
  }

  remove(field) {
    if (this.res.headersSent) return;
    this.res.removeHeader(field);
  }

  onerror(err) {
    if (err == null) return;
    if (!(err instanceof Error))
      err = new Error(util.format('non-error thrown: %j', err));

    let headersSent = false;
    if (this.res.headersSent || this.writable) {
      headersSent = err.headersSent = true;
    }

    this.app.emit('error', err, this);
    if (headersSent) return;

    const { res } = this;
    res.getHeaderNames().forEach(name => res.removeHeader(name));
    this.set(err.headers);
    this.type = 'text';
    if (err.code == 'ENOENT') err.status = 404;
    if (typeof err.status !== 'number' || !statuses[err.status])
      err.status = 500;

    const code = statuses[err.status];
    const msg = err.expose ? err.message : code;
    this.status = err.status;
    this.length = Buffer.byteLength(msg);
    res.end(msg);
  }

  get writable() {
    if (this.res.finished) return false;

    const socket = this.res.socket;
    if (!socket) return true;
    return socket.writable;
  }

  get type() {
    const type = this.get('Content-Type');
    if (!type) return '';
    return type.split(';', 1)[0];
  }

  get status() {
    return this.res.statusCode;
  }

  get body() {
    return this._body;
  }

  get headers() {
    return this.res.getHeaders();
  }

  get protocol() {
    if (this.socket.encrypted) return 'https';
    const proto = this.get('X-Forwarded-Proto');
    return proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
  }

  get host() {
    let host = proxy && this.get('X-Forwarded-Host');
    if (!host) {
      if (this.req.httpVersionMajor >= 2) host = this.get(':authority');
      if (!host) host = this.get('Host');
    }
    if (!host) return '';
    return host.split(/\s*,\s*/, 1)[0];
  }

  get url() {
    return this.req.url;
  }

  get secure() {
    return this.protocol === 'https';
  }

  set type(type) {
    type = getType(type);
    if (type) {
      this.set('Content-Type', type);
    } else {
      this.remove('Content-Type');
    }
  }

  set status(code) {
    if (this.res.headersSent) return;
    if (!Number.isInteger(code))
      throw new TypeError('status code must be a number');
    if (code <= 100 || code >= 999)
      throw new Error(`invalid status code: ${code}`);
    this._expilictStatus = true;
    this.res.statusCode = code;
    if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses[code];
    if (this.body && statuses.empty[code]) this.body = null;
  }

  set body(val) {
    const original = this._body;
    this._body = val;

    if (val == null) {
      if (!statuses.empty[this.status]) this.status = 204;
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    if (!this._expilictStatus) this.status = 200;

    const setType = !this.headers['content-type'];

    if (typeof val === 'string') {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // TODO: check for type stream

    this.remove('Content-Length');
    this.type = 'json';
  }
};
