/*globals process */
"use strict";

var express = require('express'),
    path = require('path'),
    config = require('./lib/config'),
    graph = require('ld-graph'),
    url = require('url'),
    app = express(),
    browserify = require('browserify-middleware'),
    Server;

browserify.settings.development("basedir",  "./");
app.use(express.static(path.join(__dirname, '/../public')));

app.get('/js/bundle.js', browserify([
  {'./client/src/search': {"expose": "search"}},
  {'./client/src/work': {"expose": "work"}},
  {'./client/src/person': {"expose": "person"}}
]));

app.get('/config', function (request, response) {
  response.json(config.get(process.env));
});

app.get('/search', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile('search.html', {title: 'Søk', root: __dirname + '/../public/'});
});

app.get('/person/:id', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile('person.html', {title: 'Person', root: __dirname + '/../public/'});
});

app.get('/work/:id', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile('work.html', {title: 'Verk', root: __dirname + '/../public/'});
});

app.get('/version', function (request, response) {
  response.json({'jenkinsId': process.env.JENKINSID, 'gitref': process.env.GITREF})
});

Server = app.listen(process.env.BIND_PORT || 8000, process.env.BIND_IP, function () {
  var host = Server.address().address,
      port = Server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});
