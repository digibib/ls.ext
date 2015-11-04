/*global require, it, describe, before, after, document, Promise, Person*/
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
    var ractive, Person;

    before(function (done) {

      // load module
      Person = require("../src/person.js");

      // stub ID returned from window.location
      sinon.stub(Person, "getResourceID", function () {
        return "h123456";
      });

      // stub http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {
        switch (path) {
          case "/config":
            return Promise.resolve({data: { host: "192.168.50.12", port: 7000 }});
          case "/person_template.html":
            return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/person_template.html", "UTF-8")});
          case "http://192.168.50.12:7000/person/h123456":
            return Promise.resolve({data: fs.readFileSync(__dirname + "/../module-test/h123456.json", "UTF-8") });
          case "http://192.168.50.12:7000/person/h123456/works":
            return Promise.resolve({data: fs.readFileSync(__dirname + "/../module-test/w123456.json", "UTF-8") });
        }
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "person-app");
      document.body.appendChild(fixture);

      Person.init().then(function (r) {
        ractive = r;
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    after(function () {
      axios.get.restore();
      Person.getResourceID.restore();
    });

    it("should get person ID from window.location", function (done) {
      expect(Person.getResourceID()).to.eq("h123456");
      done();
    });

    it("should display name, birth- and deathyear of person", function (done) {
      expect(document.querySelector("[data-automation-id='person-name']").innerHTML).to.eq("R. Rolfsen");
      expect(document.querySelector("[data-automation-id='person-birth']").innerHTML).to.eq("1977");
      expect(document.querySelector("[data-automation-id='person-death']").innerHTML).to.eq("1981");
      done();
    });

    it("should list the works of a person", function (done) {
      expect(document.querySelectorAll(".work").length).to.eq(ractive.get("works").length);
      done();
    });

  });

});
