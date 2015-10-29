/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs"),
  jsdom = require("mocha-jsdom");

describe("Catalinker", function () {
  describe("/work", function () {
    jsdom();
    var ractive, Work;

    before(function (done) {

      // load module
      //Work = require("../src/work.js");

      // stub ID returned from window.location
      //sinon.stub(Work, "getResourceID", function () {
      //  return "w123456";
      //});

      // stub http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: {
            kohaOpacUri: "http://koha.deichman.no",
            kohaIntraUri: "http://koha.deichman.no",
            ontologyUri: "http://127.0.0.1:7777/ontology",
            resourceApiUri: "http://127.0.0.1:7777/"
          }});
        case "/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "mocks/ontology.json", "UTF-8") });
        case "/authorized_values/language":
          return Promise.resolve({data: fs.readFileSync(__dirname + "mocks/authorized_language.json", "UTF-8") });
        case "/authorized_values/format":
          return Promise.resolve({data: fs.readFileSync(__dirname + "mocks/authorized_format.json", "UTF-8") });
        case "/index.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../../src/index.html", "UTF-8") });
        case "http://192.168.50.12:7000/work/w123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../module-test/w123456.json", "UTF-8") });
        case "http://192.168.50.12:7000/work/w123456/items":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../module-test/w123456items.json", "UTF-8") });
        }
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "catalinker-work");
      document.body.appendChild(fixture);

      // load module
      Work.init().then(function (w) {
        ractive = w;
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    after(function () {
      axios.get.restore();
      Work.getResourceID.restore();
    });

    it("Katalogisering av verk - har riktig tittel", function () {
      expect("title").to.eq("Katalogisering av verk");
      expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering av verk");
    });

  });
});
