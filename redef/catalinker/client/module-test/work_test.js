/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs"),
  jsdom = require("mocha-jsdom");

describe("Catalinker", function () {
  describe("/Work", function () {
    jsdom();
    var testRactive, Main;

    before(function (done) {

      // load module
      Main = require("../src/main.js");

      // STUBS

      sinon.stub(Main, "getResourceType", function () {
        return "Work"; // ID returned from window.location
      });

      // URL parameter
      sinon.stub(Main, "getURLParameter", function () {
        return "http://192.168.50.12:7000/work/w123456";
      });

      // http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: {
            kohaOpacUri: "http://koha.deichman.no",
            kohaIntraUri: "http://koha.deichman.no",
            ontologyUri: "http://192.168.50.12:7000/ontology",
            resourceApiUri: "http://192.168.50.12:7000/"
          }});
        case "/main_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../src/main_template.html", "UTF-8") });
        case "http://192.168.50.12:7000/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "http://192.168.50.12:7000/work/w123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/w123456.json", "UTF-8") });
        }
      });
      // Stub creating new resource
      sinon.stub(axios, "post", function (path, data, headers) {
        return Promise.resolve({data: {}, headers: { location: ""} });
      });

      // Stub updating resource
      sinon.stub(axios, "patch", function (path, data, headers) {
        return Promise.resolve({data: {}, headers: { location: ""} });
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "container");
      document.body.appendChild(fixture);

      // load module
      Main.init().then(function (m) {
        testRactive = m;
        return Main.loadOntology();
      }).then(function () {
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    after(function (done) {
      axios.get.restore();
      axios.post.restore();
      axios.patch.restore();
      Main.getResourceType.restore();
      Main.getURLParameter.restore();
      done();
    });

    it('henter ressurstype fra siste ledd i pathname i url', function (done) {
      expect(Main.getResourceType()).to.equal("Work");
      done();
    });

    it("har riktig side-tittel", function (done) {
      expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering av verk");
      done();
    });

    it("gir riktig ressurs-URI", function (done) {
      expect(document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value).to.equal("http://192.168.50.12:7000/work/w123456");
      done();
    });
  });
});
