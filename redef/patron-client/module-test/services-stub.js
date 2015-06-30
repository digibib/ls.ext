/*jslint unparam: true, node: true */

"use strict";

var http = require('http'),
    router = require('router')(),
    finalhandler = require('finalhandler');

function getJson(path, json) {
    router.get(path, function (req, res) {
        res.statusCode = 200;
        res.end(JSON.stringify(json));
    });
    console.log("Stubbing GET: '" + path + "'");
}

function start(port) {
    http.createServer(function (request, response) {
        router(request, response, finalhandler(request, response));
    }).listen(port);
    console.log("Started stub services on port: " + port);
}

module.exports = {
    start: start,
    getJson: getJson
};