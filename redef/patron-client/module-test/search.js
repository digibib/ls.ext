/*global require, it, describe, before, document*/
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    jsdom = require("mocha-jsdom");


describe("PatronClient", function () {
  describe("/search", function () {
    jsdom();
    var Search;
    var ractive;
    before(function (done) {
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "app");
      document.body.appendChild(fixture);
      Search = require("../public/search.js");
      Search.then(function (r) {
        ractive = r;
        done();
      });
    });
    it("should load search hits into browser", function (done) {
      ractive.set("hits.total", 1);
      expect(document.querySelector("[data-automation-id='hits-total']").innerHTML).to.eq("1");
      done();
    });
  });
});
