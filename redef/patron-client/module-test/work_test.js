/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    axios = require("axios"),
    fs = require("fs"),
    jsdom = require("mocha-jsdom");

describe("PatronClient", function () {
  describe("/work", function () {
    jsdom();
    var ractive;

    before(function (done) {

      // stub http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {
        switch (path) {
        case "/config":
          return Promise.resolve({data: { host: "192.168.50.12", port: 7000 }});
        case "/work_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/work_template.html", "UTF-8") });
        // TODO stub work/:id og work/:id/items her
        }
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "work-app");
      document.body.appendChild(fixture);

      // load module
      require("../src/work.js").then(function (r) {
        ractive = r;
        done();
      }).catch(done);
    });

    after(function () {
      axios.get.restore();
    });

  });

});
