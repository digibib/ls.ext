var http = (function() {
  "use strict";

  function doReq(method, path, body, onSuccess, onFailure ) {
    var req = new XMLHttpRequest();
    req.open(method, path, true);
    req.setRequestHeader('Accept', 'application/ld+json');
    switch (method) {
      case "PATCH":
        req.setRequestHeader('Content-Type','application/ldpatch+json');
        break;
      // etc
    }
 
    req.onload = function() {
     if (req.status >= 200 && req.status < 400) {
        onSuccess(req);
     } else {
        // request reached server, but we got an error
        onFailure(req.responseText);
      }
    };

    // request didn't reach server
    req.onerror = onFailure;

    req.send(body);
  }

  // return exported functions
  return {
    get: function(path, onSuccess, onFailure) { 
      doReq("GET", path, null, onSuccess, onFailure);
    },
    post: function(path, body, onSuccess, onFailure) {
      doReq("POST", path, body, onSuccess, onFailure);
    },
    put: function(path, body, onSuccess, onFailure) {
      doReq("PUT", path, body, onSuccess, onFailure);
    },
    patch: function(path, body, onSuccess, onFailure) {
      doReq("PATCH", path, body, onSuccess, onFailure);
    },
    delete: function(path, onSuccess, onFailure) {
      doReq("DELETE", path, null, onSuccess, onFailure);
    }
  };
}());

