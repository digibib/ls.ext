/*jslint unparam: true, node: true */
"use strict";

var express = require('express'),
    hogan = require('fs-hogan'),
    http = require('http'),
    config = require('./lib/config');
var app = express();

app.set('view engine', 'hjs');
app.engine('hjs', hogan.renderFile);

app.get('/work/:id', function (request, response) {

    var parameters = config.get();
    parameters.path = "/work/" + request.params.id;

    http.get(parameters, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            var data = JSON.parse(body);
            console.log("Received from services for '" + parameters.path + "': " + body);
            response.render('index', data);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
});

var Server = app.listen(8000, function () {
    var host = Server.address().address,
        port = Server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});