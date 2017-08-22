/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs");

describe("Catalinker", function () {
  describe("/Person", function () {

    require('./testdom')('<html><body><div id="container"/></body></html>');
    var testRactive, Main;

    before(function (done) {

      // load module
      Main = require("../client/src/main_old.js");

      // STUBS

      sinon.stub(Main, "getResourceType").callsFake(function () {
        return "Person"; // ID returned from window.location
      });

      // URL parameter
      sinon.stub(Main, "getURLParameter").callsFake(function () {
        return "/services/person/h123456";
      });

      // http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get").callsFake(function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: {
            kohaOpacUri: "http://koha.deichman.no",
            kohaIntraUri: "http://koha.deichman.no",
            ontologyUri: "/services/ontology",
            resourceApiUri: "/services/"
          }});
        case "/main_template_old.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/main_template_old.html", "UTF-8") });
        case "/services/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "/services/authorized_values/nationality":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_nationality.json", "UTF-8") });
        case "/services/person/h123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/h123456.json", "UTF-8") });
      }
      });
      // Stub creating new resource
      sinon.stub(axios, "post").callsFake(function (path, data, headers) {
        return Promise.resolve({data: {}, headers: { location: ""} });
      });

      // Stub updating resource
      sinon.stub(axios, "patch").callsFake(function (path, data, headers) {
        return Promise.resolve({data: {}, headers: { location: ""} });
      });

      // load module
      Main.init("/main_template_old.html").then(function (m) {
        testRactive = m;
        return Main.loadOntology();
      }).then(function () {
        return testRactive.update();
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

    describe("Registrere verk", function () {
      it('henter ressurstype fra siste ledd i pathname i url', function (done) {
        expect(Main.getResourceType()).to.equal("Person");
        done();
      });

      it("har riktig side-tittel", function (done) {
        expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering av person");
        done();
      });

      it("gir riktig ressurs-URI", function (done) {
        expect(document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value).to.equal("/services/person/h123456");
        done();
      });
    });

    describe("Eksisterende person", function () {
      it("populerer felt riktig", function (done) {
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#personTitle_0"]')[0].value).to.equal("Dr. Macabre");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#name_0"]')[0].value).to.equal("R. Rolfsen");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#birthYear_0"]')[0].value).to.equal("1977");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#deathYear_0"]')[0].value).to.equal("1981");
        done();
      });

      it("gir riktig antall options i authorized values dropdown", function (done) {
        expect(document.querySelectorAll('select[data-automation-id="http://192.168.50.12:7000/ontology#nationality_0"] option').length).to.equal(4);
        done();
      });
    });

  });
});
