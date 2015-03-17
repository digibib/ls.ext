/*jslint unparam: true, node: true */
"use strict";

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

var server = app.listen(8000, function () {

    var host = server.address().address,
        port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);

});
