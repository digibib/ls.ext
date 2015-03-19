/*jslint unparam: true, node: true */

"use strict";

module.exports = (function (http, journey) {

    var router = new journey.Router();

    function start(port) {
        http.createServer(function (request, response) {
            var body = "";
            request.addListener('data', function (chunk) { body += chunk; });
            request.addListener('end', function () {
                router.handle(request, body, function (result) {
                    response.writeHead(result.status, result.headers);
                    response.end(result.body);
                });
            });
        }).listen(port);
        console.log("Started stub services on port: " + port);
    }

    function getJson(path, json) {
        router.get(path).bind(function (req, res) {
            res.send(json);
        });
        console.log("Stubbing GET: '" + path + "'");
    }

    return {
        start: start,
        getJson: getJson
    };
}(require('http'), require('journey')));
