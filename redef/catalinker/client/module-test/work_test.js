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
    var ractive, Main;

    before(function (done) {

      // load module
      Main = require("../src/main.js");

      /* STUBS */

      // ID returned from window.location
      sinon.stub(Main, "getResourceType", function () {
        return "Work";
      });

      // URI parameter
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
        case "/index_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../src/index_template.html", "UTF-8") });
        case "http://192.168.50.12:7000/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/language":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_language.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/format":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_format.json", "UTF-8") });
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
        ractive = m;
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

    /*
    it("gir riktig ressurs-ID, og er ikke redigerbar", function (done) {
      expect(document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#recordID_0"]')[0].value).to.equal("123456");
      expect(document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#recordID_0"]')[0].disabled).to.equal(true);
      done();
    });

    it("gir riktig antall options i authorized values dropdown", function (done) {
      expect(document.querySelectorAll('[class="prop-input http://127.0.0.1:7777/ontology#format"] option').length).to.equal(5);
      expect(document.querySelectorAll('[class="prop-input http://127.0.0.1:7777/ontology#language"] option').length).to.equal(4);
      done();
    });

    it("gir riktig options i format select list", function (done) {
      var opts = document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#format_0"] select';
      expect(opts).to.equal("something");
      done();
    });

    it("gir riktig options i language select list", function (done) {
      var opts = document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#language_0"] select';
      expect(opts).to.equal("something");
      done();
    });
    */
  });
});
