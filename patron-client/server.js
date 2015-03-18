/*jslint unparam: true, node: true */
"use strict";

var express = require('express'),
    http = require('http'),
    hogan = require('fs-hogan').set({ templates: './templates' });
var app = express();

var parameters = {hostname: '192.168.50.50', port: '8080', path: '/work/1'};

var render = function (data) {
    hogan.renderFile('index.hjs', data, function (err, text) {
        app.get('/', function (req, res) {
            res.send(text);
        });
    });
};


http.get(parameters, function (res) {
    var body = '';
    res.on('data', function (chunk) {
        body += chunk;
    });
    res.on('end', function () {
        render(JSON.parse(body));
    });
}).on('error', function (e) {
    console.log("Got error: ", e);
});

var server = app.listen(8000, function () {

    var host = server.address().address,
        port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);

});
