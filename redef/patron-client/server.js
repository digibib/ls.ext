/*globals process */
"use strict";

var express = require('express'),
    config = require('./lib/config'),
    graph = require('ld-graph'),
    url = require('url'),
    app = express(),
    Server;

app.use(express.static('public'));

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
