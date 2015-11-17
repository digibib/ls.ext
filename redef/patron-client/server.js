/*globals process */
"use strict";

var express = require('express'),
    config = require('./lib/config'),
    graph = require('ld-graph'),
    url = require('url'),
    app = express(),
    browserify = require('browserify-middleware'),
    Server;

browserify.settings.development("basedir",  "./");



app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/js/bundle.js', browserify([
  {'./client/src/search': {"expose":"search"}},
  {'./client/src/work': {"expose":"work"}},
  {'./client/src/person': {"expose":"person"}}
]));
//app.get('/js/bundle.js', browserify([require.resolve('./client/src/search')]));

app.get('/config', function (request, response) {
  response.json(config.get(process.env));
});

app.get('/search', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile(__dirname +'/public/search.html');
});

app.get('/person/:id', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile(__dirname +'/public/person.html');
});

app.get('/work/:id', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile(__dirname +'/public/work.html');
});

Server = app.listen(8000, function () {
  var host = Server.address().address,
      port = Server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});
