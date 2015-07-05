var http = (function() {
  "use strict";

  function plus(a,b) {
    return a+b;
  }

  function doReq(method, path, onSuccess, onFailure ) {
    var req = new XMLHttpRequest();
    req.open(method, path, true);
    req.setRequestHeader('Content-Type','application/json; charset=UTF-8');

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

    req.send();
  }

  // return exported functions
  return {
    plus: plus,
    get: function(path, onSuccess, onFailure) {
      doReq("GET", path, onSuccess, onFailure);
    },
    post: function(path, onSuccess, onFailure) {
      doReq("POST", path, onSuccess, onFailure);
    }
  };
}());

