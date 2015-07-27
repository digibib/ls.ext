(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {

  function doReq(method, path, headers, body, onSuccess, onFailure) {
    var req = new XMLHttpRequest();
    req.open(method, path, true);

    for (var prop in headers) {
      req.setRequestHeader(prop, headers[prop]);
    }

    req.onload = function () {
      if (req.status >= 200 && req.status < 400) {
        onSuccess(req);
      } else {

        // request reached server, but we got an error
        onFailure(req.responseText);
      }
    };

    // request didn't reach server
    req.onerror = onFailure;

    if (body !== "") {
      req.send(body);
    } else {
      req.send();
    }
  }

  // return exported functions
  return {
    get: function (path, headers, onSuccess, onFailure) {
      doReq("GET", path, headers, "", onSuccess, onFailure);
    },
    post: function (path, headers, body, onSuccess, onFailure) {
      doReq("POST", path, headers, body, onSuccess, onFailure);
    },
    put: function (path, headers, body, onSuccess, onFailure) {
      doReq("PUT", path, headers, body, onSuccess, onFailure);
    },
    patch: function (path, headers, body, onSuccess, onFailure) {
      doReq("PATCH", path, headers, body, onSuccess, onFailure);
    },
    delete: function (path, headers, onSuccess, onFailure) {
      doReq("DELETE", path, headers, "", onSuccess, onFailure);
    }
  };
}));
