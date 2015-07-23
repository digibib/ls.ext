/*global require */
"use strict";

var url = require('url');

module.exports = (function (url) {

  function get() {
    var servicesPort = process.env.SERVICES_PORT,
        params = url.parse(servicesPort);
    return {host: params.hostname, port: params.port};
  }
  return {get: get};
}(url));
