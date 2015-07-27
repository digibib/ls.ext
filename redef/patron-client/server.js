/*globals process */
"use strict";

var express = require('express'),
    hbs = require('hbs'),
    http = require('http'),
    config = require('./lib/config'),
    app = express(),
    Server;

app.set('view engine', 'hbs');
app.use(express.static('public'));

hbs.registerHelper('firstValue', function (resource, property, graph) {
  var props = resource.property(graph.resolve(property));
  if (props.length > 0) {
    if (props[0].language !== "") {
      return '"' + props[0].value + '"@' + props[0].language;
    }
    return props[0].value;
  }
  return "";
});

hbs.registerHelper('allValues', function (resource, property, graph) {
  return resource.property(graph.resolve(property));
});

hbs.registerHelper('allValuesConcat', function (resource, property, graph) {
  var res = [];
  resource.property(graph.resolve(property)).forEach(function (p) {
    if (p.language !== "") {
      res.push('"' + p.value + '"@' + p.language);
    } else {
      res.push(p.value);
    }
  });
  return res.join(", ");
});

// TODO the graph module is copied from catlinker/lib.js - modularize and use requirejs
var graph = (function () {

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
  }

  Work.prototype = Object.create(Resource.prototype);
  Work.prototype.constructor = Work;

  function Publication(uri) {
    Resource.call(this, uri);
  }

  Publication.prototype = Object.create(Resource.prototype);
  Publication.prototype.constructor = Publication;

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

  var data = {};
  data["@context"] = {};

  function resolve(uri) {
    var i = uri.indexOf(":");
    var prefix = uri.substr(0, i);
    for (var k in data["@context"]) {
      if (prefix === k) {
        return data["@context"][k] + uri.substr(i + 1);
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

  function attatchPublications(work, data) {
    data["@graph"].forEach(function (resource) {
      if (resource["deichman:publicationOf"] === work.uri) {
        var p = new Publication(resource["@id"]);
        p.properties = extractProps(resource);
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
          w.properties = extractProps(resource);
          attatchPublications(w, data);
          works.push(w);
        }
      });
    } else {
      // graph holds just one resource
      if (data["@type"] === "deichman:Work") {
        var w = new Work(data["@id"]);
        w.properties = extractProps(data);
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
}());

function getData(body) {
  var data = {};
  try {
    data = {ok: true, data: JSON.parse(body)};
  } catch (error) {
    data = {ok: false, data: error};
  }
  return data;
}

function getItems(uri, callback) {
  http.get(uri, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var data = getData(body),
          items = [];
      if (data.ok) {
        console.log(body);
        data.data['@graph'].forEach(function (item) {
          if (item['@type'] && item['@type'] === 'deichman:Item') {
            items.push(item);
          }
        });
        console.log(items);
        callback(items);
      } else {
        callback(null);
      }
    });
  }).on('error', function (e) {
    console.log("Got error: ", e, uri);
    callback(null);
  });
}

app.get('/work/:id', function (request, response) {
  var parameters = config.get(process.env);
  parameters.path = "/work/" + request.params.id;

  http.get(parameters, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var data = getData(body);
      console.log("Received reply from services for '" + parameters.path + "' with status code: " + res.statusCode);
      if (data.ok) {
        parameters.path += '/items';
        getItems(parameters, function (items) {
          data.data.items = items;
          data.data["deichman:name"] = titlesToString(data.data["deichman:name"]);
          response.render('index', data.data);
        });
      } else {
        response.status(res.statusCode);
        response.render('error', {data: res.statusMessage});
      }
    });
  }).on('error', function (e) {
    console.log("Got error: ", e);
  });
});

Server = app.listen(8000, function () {
  var host = Server.address().address,
      port = Server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});
