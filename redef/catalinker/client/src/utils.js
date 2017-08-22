(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Util = factory();
  }
}(this, function () {
  return {
    proxyToServices: function (url) {
      var r = new RegExp('http://[^/]+/')
      return url.replace(url.match(r), '/services/')
    },
    ensureJSON: function (res) {
      return (typeof res === 'string') ? JSON.parse(res) : res
    },
    isPromise: function (value) {
      return value && value.then && typeof value.then === 'function'
    }
  };
}));
