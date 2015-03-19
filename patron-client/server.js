/*jslint unparam: true, node: true */
"use strict";

var express = require('express'),
    http = require('http'),
    hogan = require('fs-hogan');
var app = express();

app.set('view engine', 'hjs');
app.engine('hjs', hogan.renderFile);

app.get('/', function (request, response) {
    var parameters = {hostname: '192.168.50.50', port: '8080', path: '/work/1'};
    http.get(parameters, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            var data = JSON.parse(body);
            response.render('index', data);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
});

var server = app.listen(8000, function () {
    var host = server.address().address,
        port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
