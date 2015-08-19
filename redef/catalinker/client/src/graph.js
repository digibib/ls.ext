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

  // Resources superclass. All domain classes(objects) inherits form this.
  var Resource = function (uri) {
    this.uri = uri;
    this.properties = [];
  };

  // filter properties by predicate
  Resource.prototype.property = function (predicate) {
    var res = [];
    this.properties.forEach(function (p) {
      if (p.predicate === predicate) {
        res.push({value: p.value, language: p.language, datatype: p.datatype});
      }
    });
    return res;
  };

  function Work(uri) {
    Resource.call(this, uri);
    this.publications = [];
    this.items        = [];
  }

  Work.prototype = Object.create(Resource.prototype);
  Work.prototype.constructor = Work;

  function Publication(uri) {
    Resource.call(this, uri);
    this.items = [];
  }

  Publication.prototype = Object.create(Resource.prototype);
  Publication.prototype.constructor = Publication;

  function Item(uri) {
    Resource.call(this, uri);
  }

  Item.prototype = Object.create(Resource.prototype);
  Item.prototype.constructor = Item;

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

  var context = {};

  function resolve(uri) {
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

  function extractProps(resource) {
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
            res.push(new Property(resolve(prop), p.val, p.lang, p.dt));
          }
      }
    }
    return res;
  }

  function attachPublicationsAndItems(work, workdata, itemsdata) {
    workdata["@graph"].forEach(function (workresource) {
      if (workresource["deichman:publicationOf"] === work.uri) {
        var p = new Publication(workresource["@id"]);
        p.properties = extractProps(workresource);
        if (itemsdata["@graph"]) {
          itemsdata["@graph"].forEach(function (itemresource) {
            if (p.uri === itemresource["@id"] && itemresource["deichman:hasEdition"]) {
              if (!Array.isArray(itemresource["deichman:hasEdition"])) {
                // Force into array, even if its only one item
                itemresource["deichman:hasEdition"] = [itemresource["deichman:hasEdition"]];
              }
              itemresource["deichman:hasEdition"].forEach(function (i) {
                itemsdata["@graph"].forEach(function (g) {
                  if (g["@id"] === i["@id"]) {
                    var item = new Item(g);
                    item.properties = extractProps(g);
                    p.items.push(item);
                    work.items.push(item);
                  }
                });
              });
            }
          });
        }
        work.publications.push(p);
      }
    });
  }

  function parse(workresponse, itemsresponse) {
    var workdata = JSON.parse(workresponse);
    var itemsdata = [];
    context = workdata["@context"];  // set context to work
    if (itemsresponse) {
      itemsdata = JSON.parse(itemsresponse);
    }

    var works = [];

    if (workdata["@graph"]) {
      workdata["@graph"].forEach(function (resource) {
        if (resource["@type"] === "deichman:Work") {
          var w = new Work(resource["@id"]);
          w.properties = extractProps(resource);
          attachPublicationsAndItems(w, workdata, itemsdata);
          works.push(w);
        }
      });
    } else {
      // graph holds just one resource
      if (workdata["@type"] === "deichman:Work") {
        var w = new Work(workdata["@id"]);
        w.properties = extractProps(workdata);
        works.push(w);
      }
    }

    return {
      works: works,
      resolve: resolve
    };
  }

  return {
    parse: parse
  };

}));
