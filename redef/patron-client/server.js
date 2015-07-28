/*globals process */
"use strict";

var express = require('express'),
    hbs = require('hbs'),
    http = require('http'),
    config = require('./lib/config'),
    graph = require('./lib/graph'),
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
        data.data.graph = graph.parse(body);
        data.data.work = data.data.graph.works[0];

        parameters.path += '/items';
        getItems(parameters, function (items) {
          data.data.items = items;
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
