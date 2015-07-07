var http = (function() {
  "use strict";

  function doReq(method, path, body, onSuccess, onFailure ) {
    var req = new XMLHttpRequest();
    req.open(method, path, true);
    req.setRequestHeader('Accept', 'application/ld+json');
    switch (method) {
      case "POST":
        req.setRequestHeader('Content-Type','application/json');
        break;
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

    if ( body !== "" ) {
      req.send(body);
    } else {
      req.send();
    }
  }

  // return exported functions
  return {
    get: function(path, onSuccess, onFailure) { 
      doReq("GET", path, "", onSuccess, onFailure);
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
      doReq("DELETE", path, "", onSuccess, onFailure);
    }
  };
}());




var rdf = (function() {
  "use strict";

  function propsByClass( ontology, cls ) {
    return ontology["@graph"].filter(function(e) {
      return ( e["@type"] == "rdfs:Property" &&
        ( e["rdfs:domain"] === undefined ||
          e["rdfs:domain"]["@id"] === "rdfs:Class" || e["rdfs:domain"]["@id"] == "deichman:"+cls ) );
    });
  }

  function resolveURI( ontology, uri ) {
    var i = uri.indexOf(":");
    var prefix = uri.substr( 0, i );
    for ( var k in ontology["@context"] ) {
      if ( prefix === k ) {
        return ontology["@context"][k]+uri.substr(i+1);
      }
    }
  }

  function createPatch( subject, predicate, el ) {
    var addPatch,
        delPatch;

    if ( el.current.value !== "") {
      addPatch = { op: "add", s: subject, p: predicate, o: { value: el.current.value } }
      if ( el.current.lang != "" ) {
        addPatch.o.lang = el.current.lang;
      }
    }

    if ( el.old.value !== "" ) {
    delPatch = { op: "del", s: subject, p: predicate, o: { value: el.old.value } }
      if ( el.old.lang != "" ) {
      delPatch.o.lang = el.old.lang;
      }
    }


    if (delPatch && addPatch) {
      return JSON.stringify([delPatch,addPatch]);
    } else if (delPatch) {
      return JSON.stringify(delPatch);
    } else {
      return JSON.stringify(addPatch);
    }
  }

  // exported functions
  return {
    propsByClass: propsByClass,
    createPatch: createPatch,
    resolveURI: resolveURI
  };
})();
