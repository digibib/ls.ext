var cl = (function () {
  "use strict";

  var graph = (function () {

    var Work = function (uri) {
      this.uri = uri;
      this.properties = [];
      this.publications = [];
    };

    var Property = function (predicate, value, lang, datatype) {
      this.predicate = predicate;
      this.value = value;
      if (lang && lang !== "") {
        this.language =  lang;
        this.datatype = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
      } else {
        this.language = "";
        this.datatype = datatype || "http://www.w3.org/2001/XMLSchema#string";
      }
    };

    var Publication = function (uri) {
      this.uri = uri;
      this.properties = [];
    };

    Publication.prototype.property = function (predicate) {
      var res = [];
      this.properties.forEach(function (p) {
        if (p.predicate === predicate) {
          res.push({value: p.value, language: p.language, datatype: p.datatype});
        }
      });
      return res;
    };

    var data = {};

    function resolve(uri, context) {
      var i = uri.indexOf(":");
      var prefix = uri.substr(0, i);
      for (var k in context) {
        if (prefix === k) {
          return context[k] + uri.substr(i + 1);
        }
      }
      return uri; // not in context, return unmodified
    }

    function unifyProps(props) {
      var res = [];
      if (Array.isArray(props)) {
        props.forEach(function (p) {
          if (typeof p === "string") {
            res.push({val: p, lang: "", dt: ""});
          } else {
            res.push({val: p["@value"], lang: p["@language"], dt: p["@type"]});
          }
        });
      } else if (typeof props === "object") {
        res.push({val: props["@value"], lang: props["@language"], dt: props["@type"]});
      } else {
        res.push({val: props, lang: "", dt: ""});
      }
      return res;
    }

    function extractProps(resource, context) {
      var res = [];
      for (var prop in resource) {
        switch (prop) {
          case "@id":
          case "@type":
          case "@context":
            break;
          default:
            var props = unifyProps(resource[prop]);
            for (var i = 0; i < props.length; i++) {
              var p = props[i];
              res.push(new Property(resolve(prop, context), p.val, p.lang, p.dt));
            }
        }
      }
      return res;
    }

    function attatchPublications(work, data) {
      data["@graph"].forEach(function (resource) {
        if (resource["deichman:publicationOf"] === work.uri) {
          var p = new Publication(resource["@id"]);
          p.properties = extractProps(resource, data["@context"]);
          work.publications.push(p);
        }
      });
    }

    function parse(jsonld) {
      data = JSON.parse(jsonld);

      var works = [];

      if (data["@graph"]) {
        data["@graph"].forEach(function (resource) {
          if (resource["@type"] === "deichman:Work") {
            var w = new Work(resource["@id"]);
            w.properties = extractProps(resource, data["@context"]);
            attatchPublications(w, data);
            works.push(w);
          }
        });
      } else {
        // graph holds just one resource
        if (data["@type"] === "deichman:Work") {
          var w = new Work(data["@id"]);
          w.properties = extractProps(data, data["@context"]);
          works.push(w);
        }
      }

      return {
        works: works
      };
    }

    return {
      parse: parse
    };
  }());

  var http = (function () {

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
  }());

  var rdf = (function () {

    // propsByClass extract the properties from the ontology which are valid for a given class.
    // This includes properties with unspecified domain (applicable for all classes), and those
    // with specified range as the given class.
    function propsByClass(ontology, cls) {
      return ontology["@graph"].filter(function (e) {
        return (e["@type"] == "rdfs:Property" &&
          (e["rdfs:domain"] === undefined ||
            e["rdfs:domain"]["@id"] === "rdfs:Class" || e["rdfs:domain"]["@id"] == "deichman:" + cls));
      });
    }

    // resolveURI resolves a URI in prefixed form to its full form, according to prefixes specified
    // in the ontology.
    function resolveURI(ontology, uri) {
      var i = uri.indexOf(":");
      var prefix = uri.substr(0, i);
      for (var k in ontology["@context"]) {
        if (prefix === k) {
          return ontology["@context"][k] + uri.substr(i + 1);
        }
      }
    }

    // validateLiteral checks that a given value conforms to it's xsd:range(datatype).
    function validateLiteral(value, range) {
      switch (range) {
        case "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString":
        case "http://www.w3.org/2001/XMLSchema#string":
          return true; // a javscript string is always valid as xsd:string
        case "http://www.w3.org/2001/XMLSchema#gYear":
          // According to its specification, a xsd:gYear allows time-zone information, but
          // we don't want that, and only accepts negative (BCE) or positive (CE) integers.
          // TODO shall we require 0-padding - i.e not allow "92" but require "0092"?
          return /^-?(\d){1,4}$/.test(value);
        case "http://www.w3.org/2001/XMLSchema#nonNegativeInteger":
          return /^\+?(\d)+$/.test(value);
        default:
          var err = "don't know how to validate literal of range: <" + range + ">";
          throw err;
      }
    }

    // createPatch creates a patch request for a given subject, predicate and value (el)
    // as it is represented in the client UI.
    function createPatch(subject, predicate, el) {
      var addPatch,
          delPatch;

      if (el.current.value !== "") {
        addPatch = { op: "add", s: subject, p: predicate, o: { value: el.current.value } };
        if (el.current.lang !== "") {
          addPatch.o.lang = el.current.lang;
        }

        if (el.current.datatype !== "") {
          addPatch.o.datatype = el.current.datatype;
        }
      }

      if (el.old.value !== "") {
        delPatch = { op: "del", s: subject, p: predicate, o: { value: el.old.value } };
        if (el.old.lang !== "") {
          delPatch.o.lang = el.old.lang;
        }

        if (el.old.datatype !== "") {
          delPatch.o.datatype = el.old.datatype;
        }
      }

      if (delPatch && addPatch) {
        return JSON.stringify([delPatch, addPatch]);
      } else if (delPatch) {
        return JSON.stringify(delPatch);
      } else {
        return JSON.stringify(addPatch);
      }
    }

    // extractValues extracts the values (properties) from the given resource in JSON-LD format,
    // and returns them in the format which the client UI uses.
    // TODO evaluate JSON-LD messiness and ambiguity VS parsing N-Triples.
    function extractValues(resource) {
      var values = {};
      for (var prop in resource) {
        switch (prop) {
          case "@id":
          case "@type":
          case "@context":
            break;
          default:
            var predicate = rdf.resolveURI(resource,  prop);
            if (typeof resource[prop] === "string") {

              // property has one value, a simple string literal
              values[predicate] = [{ old: { value: resource[prop], type: "", lang: "" },
                                    current: { value: resource[prop], type: "", lang: "" } }];
            } else if (Array.isArray(resource[prop])) {

              // property has several values
              values[predicate] = [];
              for (var v in resource[prop]) {
                var val = resource[prop][v];
                if (typeof val === "string") {
                  values[predicate].push({ old: { value: val, type: "", lang: "" },
                                         current: { value: val, type: "", lang: "" } });
                } else if (typeof val === "object") {
                  values[predicate].push({ old: { value: val["@value"], type: "", lang: val["@language"] },
                                         current: { value: val["@value"], type: "", lang: val["@language"] } });
                }
              }
            } else if (typeof resource[prop] === "object") {

              // property has one value, with language tag or datatype
              values[predicate] = [{ old: { value: resource[prop]["@value"], type: "", lang: resource[prop]["@language"] },
                                    current: { value: resource[prop]["@value"], type: "", lang: resource[prop]["@language"] } }];
            }
        }
      }

      return values;
    }

    function resourceLabel(ontology, cls, lang) {
      return ontology["@graph"].filter(
        function (e) {
          return e["@id"] == "deichman:" + cls;
        }
             )[0]["rdfs:label"].filter(
          function (e) {
            return e["@language"] == lang;
          })[0]["@value"];
    }

    // exported functions
    return {
      propsByClass: propsByClass,
      createPatch: createPatch,
      resolveURI: resolveURI,
      validateLiteral: validateLiteral,
      extractValues: extractValues,
      resourceLabel: resourceLabel
    };
  })();

  var string = (function () {
    return {
      titelize: function (s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
      }
    };
  }());

  return {
    http: http,
    rdf: rdf,
    string: string,
    graph: graph
  };
})();
