/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
expect = chai.expect,
sinon = require("sinon"),
axios = require("axios"),
fs = require("fs"),
jsdom = require("mocha-jsdom");

describe("PatronClient", function () {
  describe("/person", function () {
    jsdom();
    var ractive;

    before(function (done) {

      // stub http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {
        switch (path) {
          case "/config":
            return Promise.resolve({data: { host: "192.168.50.12", port: 7000 }});
          case "/person_template.html":
            return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/person_template.html", "UTF-8") });
          default: // case  "http://192.168.50.12:9000/person/":
            return Promise.resolve({data: {"deichman:name": "R. Rolfsen", "deichman:birth": {"@value": "1977"}, "deichman:death": {"@value": "1981"}}});
        }
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "person-app");
      document.body.appendChild(fixture);

      // load module
      require("../src/person.js").then(function (r) {
        ractive = r;
        done();
      }).catch(function (err) {
        console.log(err);
        done();
      });
    });

    after(function () {
      axios.get.restore();
    });

    it("should display name, birth- and deathyear of person", function (done) {
      expect(document.querySelector("[data-automation-id='person-name']").innerHTML).to.eq("R. Rolfsen");
      expect(document.querySelector("[data-automation-id='person-birth']").innerHTML).to.eq("1977");
      expect(document.querySelector("[data-automation-id='person-death']").innerHTML).to.eq("1981");
      done();
    });

  });

});
