/*jslint unparam: true, node: true */
"use strict";

var url = require('url');

module.exports = (function (dependencies) {

    function get() {
        var servicesPort = process.env.SERVICES_PORT,
            params = url.parse(servicesPort),
            parameters = {host: params.hostname, port: params.port};
        return parameters;
    }
    return {get: get};
}(url));