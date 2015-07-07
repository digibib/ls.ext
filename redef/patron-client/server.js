/*jslint unparam: true, node: true */
"use strict";

var express = require('express'),
    hogan = require('fs-hogan'),
    http = require('http'),
    config = require('./lib/config');
var app = express();

app.set('view engine', 'hjs');
app.engine('hjs', hogan.renderFile);

var titlesToString = function (titles) {
    if (typeof titles === "string") {
        return titles;
    }
    var res = [],
        i;
    if (Array.isArray(titles)) {
        for (i = 0; i < titles.length; i = i + 1) {
            if (typeof titles[i] === "string") {
                // simple literal
                res.push(titles[i]);
            } else {
                // language tagged or explicitly datatyped literal
                res.push('"' + titles[i]["@value"] + '"@' + titles[i]["@language"]);
            }
        }
    } else if (typeof titles === "object") {
        res.push('"' + titles["@value"] + '"@' + titles["@language"]);
    } else {
        return "";
    }
    return res.join(",");
};


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
    var parameters = config.get();
    parameters.path = "/work/" + request.params.id;

    http.get(parameters, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            var data = getData(body);
            if (data.ok) {
                parameters.path += '/items';
                getItems(parameters, function (items) {
                    data.data.items = items;
                    console.log(data.data);
                    data.data["deichman:name"] = titlesToString(data.data["deichman:name"]);
                    response.render('index', data.data);
                });
                console.log("Received from services for '" + parameters.path + "': " + body);
            } else {
                response.status(res.statusCode);
                response.render('error', {data: res.statusMessage});
            }
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