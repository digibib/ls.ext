/*global require, it, describe */
"use strict";

var expect = require('chai').expect,
    config = require('../server/lib/config');

describe('config', function () {
  describe('#get(env)', function () {
    it('should return server and port based on environment setting', function (done) {
      var env = { SERVICES_PORT: "http://someserver:666" };
      expect(config.get(env)).to.deep.equal({host: "someserver", port: "666"});
      done();
    });
  });
});


