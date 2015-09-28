(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(["ractive.min"], function (ractive) {
      return (root.Http = factory(ractive));
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("ractive.min"));
  } else {
    // Browser globals (root is window)
    root.Http = factory(root.Ractive);
  }
}(this, function (Ractive) {
  var Promise = Ractive.Promise;

  function doReq(method, path, headers, body, onSuccess, onFailure) {
    return new Promise(function (resolve, reject)  {

      var req = new XMLHttpRequest();
      req.open(method, path, true);

      for (var prop in headers) {
        req.setRequestHeader(prop, headers[prop]);
      }

      req.onload = function () {
        if (req.status >= 200 && req.status < 400) {
          resolve(req);
        } else {

          // request reached server, but we got an error
          reject({
            status: req.status,
            statusText: req.statusText
          });
        }
      };

      // request didn't reach server
      req.onerror = function () {
        reject({
          status: req.status,
          statusText: req.statusText
        });
      };

      if (body !== "") {
        req.send(body);
      } else {
        req.send();
      }

    });
  }



  // return exported functions
  return {
    get: function (path, headers, onSuccess, onFailure) {
      return doReq("GET", path, headers, "", onSuccess, onFailure);
    },
    post: function (path, headers, body) {
      return doReq("POST", path, headers, body);
    },
    put: function (path, headers, body) {
      return doReq("PUT", path, headers, body);
    },
    patch: function (path, headers, body) {
      return doReq("PATCH", path, headers, body);
    },
    delete: function (path, headers) {
      return doReq("DELETE", path, headers, "");
    }
  };
}));
