(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.StringUtil = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.StringUtil = factory();
  }
}(this, function () {
  return {
    titelize: function (s) {
      return s.charAt(0).toUpperCase() + s.substring(1);
    }
  };
}));
