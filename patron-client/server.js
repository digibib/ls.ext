/*jslint unparam: true, node: true */
"use strict";

var express = require('express'),
    hogan = require('fs-hogan').set({ templates: './templates' });
var app = express();

//http://192.168.50.50:8080/work/1
var data = {"Title": "Sult", "creator": "Knut Hamsun", "date": "1890", "editions": [{"id": "edition_00001", "isbn": "82-05-27748-6", "placement": "Voksenavdelingen, Hovedbiblioteket", "shelf": "magasinet", "status": "På hylla"}, {"id": "edition_00001", "isbn": "82-05-27748-6", "placement": "Voksenavdelingen, Hovedbiblioteket", "status": "På hylla"}]};

hogan.renderFile('index.hjs', data, function (err, text) {
    app.get('/', function (req, res) {
        res.send(text);
    });
});

var server = app.listen(8000, function () {

    var host = server.address().address,
        port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);

});
