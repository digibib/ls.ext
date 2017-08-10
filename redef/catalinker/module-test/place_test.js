/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs");

describe("Catalinker", function () {
  describe("/place", function () {

    require('./testdom')('<html><body><div id="container"/></body></html>');
    var testRactive, Main;

    before(function (done) {

      // load module
      Main = require("../client/src/main_old.js");

      // STUBS

      sinon.stub(Main, "getResourceType").callsFake(function () {
        return "Place"; // ID returned from window.location
      });

      // URL parameter
      sinon.stub(Main, "getURLParameter").callsFake(function () {
        return "http://192.168.50.12:7000/place/g123456";
      });

      // http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get").callsFake(function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: {
            kohaOpacUri: "http://koha.deichman.no",
            kohaIntraUri: "http://koha.deichman.no",
            ontologyUri: "http://192.168.50.12:7000/ontology",
            resourceApiUri: "http://192.168.50.12:7000/"
          }});
        case "/main_template_old.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/main_template_old.html", "UTF-8") });
        case "/services/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "/services/authorized_values/nationality":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_nationality.json", "UTF-8") });
        case "/services/place/g123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/g123456.json", "UTF-8") });
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
        expect(Main.getResourceType()).to.equal("Place");
        done();
      });

      it("har riktig side-tittel", function (done) {
        expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering av sted");
        done();
      });

      it("gir riktig ressurs-URI", function (done) {
        expect(document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value).to.equal("http://192.168.50.12:7000/place/g123456");
        done();
      });
    });

    describe("Eksisterende utgivelsessted", function () {
      it("populerer felt riktig", function (done) {
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#specification_0"]')[0].value).to.equal("Norge");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#prefLabel_0"]')[0].value).to.equal("Oslo");
        done();
      });
    });

  });
});
