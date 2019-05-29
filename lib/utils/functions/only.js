module.exports = (obj, keys) => {
  obj = obj || {};
  return keys.reduce((ret, key) => {
    if (obj[key] == null) return ret;
    ret[key] = obj[key];
    return ret;
  }, {});
};
