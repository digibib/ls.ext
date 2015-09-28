(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.Ontology = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Ontology = factory();
  }
}(this, function () {

  // propsByClass extract the properties from the ontology which are valid for a given class.
  // This includes properties with unspecified domain (applicable for all classes), and those
  // with specified range as the given class.
  function propsByClass(ontology, cls) {
    var res = [];
    ontology["@graph"].forEach(function (p) {
      if (p["@type"] === "rdfs:Property") {
        if (p["rdfs:domain"] === undefined || p["rdfs:domain"]["@id"] === "rdfs:Class") {
          res.push(p);
        } else if (Array.isArray(p["rdfs:domain"])) {
          p["rdfs:domain"].forEach(function (q) {
            if (q["@id"] === ("deichman:" + cls)) {
              res.push(p);
            }
          });
        } else if (p["rdfs:domain"]["@id"] === ("deichman:" + cls)) {
          res.push(p);
        }
      }
    });
    return res;
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
  function createPatch(subject, predicate, el, datatype) {
    var addPatch,
        delPatch;

    if (el.current.value !== "") {
      addPatch = { op: "add", s: subject, p: predicate, o: { value: el.current.value } };
      if (el.current.lang !== "") {
        addPatch.o.lang = el.current.lang;
      }
      addPatch.o.type = datatype;
    }

    if (el.old.value !== "") {
      delPatch = { op: "del", s: subject, p: predicate, o: { value: el.old.value } };
      if (el.old.lang !== "") {
        delPatch.o.lang = el.old.lang;
      }

      delPatch.o.type = datatype;
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
  function extractValues(resource) {
    var values = {};
    for (var prop in resource) {
      switch (prop) {
        case "@id":
        case "@type":
        case "@context":
          break;
        default:
          // unify string/object into an array
          if (!Array.isArray(resource[prop])) {
            resource[prop] = [resource[prop]];
          }

          var predicate = resolveURI(resource,  prop);
          values[predicate] = [];
          for (var v in resource[prop]) {
            var val = resource[prop][v];
            if (typeof val === "string") {
              values[predicate].push({ old: { value: val, lang: "" },
                                       current: { value: val, lang: "" } });
            } else if (typeof val === "object") {
              var temp = val["@value"];
              if (val["@id"]) {
                temp = val["@id"];
              }
              values[predicate].push({ old: { value: temp, lang: val["@language"] },
                                       current: { value: temp, lang: val["@language"] } });
            }
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
}));
