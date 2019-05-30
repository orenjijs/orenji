const statuses = require('statuses');

module.exports = ctx => {
  if (ctx.respond === false) return;

  if (!ctx.writable) return;

  const { res, status } = ctx;
  let { body } = ctx;

  if (statuses.empty[status]) {
    ctx.body = null;
    return res.end();
  }

  if (ctx.method === 'HEAD') {
    // TODO: check isJSON
    if (!res.headersSent) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.send();
  }

  if (body == null) {
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(status);
    } else {
      body = ctx.message || String(status);
    }
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  //TODO: check stream
  if (Buffer.isBuffer(body) || typeof body === 'string') return res.end(body);

  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
};
