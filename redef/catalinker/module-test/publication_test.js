/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs"),
  jsdom = require("mocha-jsdom");

describe("Catalinker", function () {
  describe("/Publication", function () {
    jsdom();
    var testRactive, Main;

    before(function (done) {

      // load module
      Main = require("../client/src/main.js");

      // STUBS

      sinon.stub(Main, "getResourceType", function () {
        return "Publication"; // ID returned from window.location
      });

      // URL parameter
      sinon.stub(Main, "getURLParameter", function () {
        return "http://192.168.50.12:7000/publication/p123456";
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
        case "/main_template_old.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/main_template_old.html", "UTF-8") });
        case "http://192.168.50.12:7000/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/language":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_language.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/format":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_format.json", "UTF-8") });
        case "http://192.168.50.12:7000/publication/p123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/p123456.json", "UTF-8") });
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

    describe("Registrere utgivelse", function () {
      it("har riktig side-tittel", function (done) {
        expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering av utgivelse");
        done();
      });

      it("gir riktig ressurs-ID, og er ikke redigerbar", function (done) {
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#recordID_0"]')[0].value).to.equal("123");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#recordID_0"]')[0].disabled).to.equal(true);
        done();
      });
    });

    describe("Endre eksisterende utgivelse", function () {
      it("populerer felt riktig", function (done) {
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#title_0"]')[0].value).to.equal("Test Publication");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#originalTitle_0"]')[0].value).to.equal("Zombie Publication");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#recordID_0"]')[0].value).to.equal("123");
        done();
      });

      it("gir riktig antall options i authorized values dropdown", function (done) {
        expect(document.querySelectorAll('select[data-automation-id="http://192.168.50.12:7000/ontology#format_0"] option').length).to.equal(4);
        expect(document.querySelectorAll('select[data-automation-id="http://192.168.50.12:7000/ontology#language_0"] option').length).to.equal(5);
        done();
      });

      it("gir sorterte options i format select list", function (done) {
        var opts = document.querySelectorAll('select[data-automation-id="http://192.168.50.12:7000/ontology#format_0"] option');
        var formats = [].map.call(opts, function (o) {
          return o.textContent;
        });
        var f = formats.toString();
        expect(f).to.equal(formats.sort().toString());
        done();
      });

      it("gir sorterte options i language select list", function (done) {
        var opts = document.querySelectorAll('select[data-automation-id="http://192.168.50.12:7000/ontology#language_0"] option');
        var languages = [].map.call(opts, function (o) {
          return o.textContent;
        });
        var l = languages.toString();
        expect(l).to.equal(languages.sort().toString());
        done();
      });
    });
  });
});
