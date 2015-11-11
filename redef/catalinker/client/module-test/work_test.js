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
        case "http://192.168.50.12:7000/search/person/_search/?q=Monkey":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/person_search_hit.json", "UTF-8") });
        case "http://192.168.50.12:7000/person/h123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/h123456.json", "UTF-8") });
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

    describe("Registrere verk", function () {
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

    describe("Eksisterende verk", function () {
      it("populerer felt riktig", function (done) {
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#title_0"]')[0].value).to.equal("Sult");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#original_title_0"]')[0].value).to.equal("Sult");
        expect(document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#year_0"]')[0].value).to.equal("1890");
        done();
      });
    });

    describe("Søk på ressurser", function () {
      it("søkefelt søker med riktig type og søkestreng", function (done) {
        // searchResource event takes predicate and searchstring as parameters
        testRactive.fire("searchResource", {}, "http://192.168.50.12:7000/ontology#creator", "Monkey");
        testRactive.update().then(function () {           // force DOM update
          var res = testRactive.get("search_result").results;
          expect(res.hits.total).to.equal(2);
          expect(res.hits.hits[0]._source.person.uri).to.equal("http://192.168.50.12:7000/person/h123456");
          expect(res.hits.hits[0]._source.person.name).to.equal("Test Monkey");
          expect(res.hits.hits[1]._source.person.uri).to.equal("http://192.168.50.12:7000/person/h234567");
          expect(res.hits.hits[1]._source.person.name).to.equal("Another Test Monkey");
          done();
        }).catch(done);
      });

      it("presenterer søketreff i en liste", function (done) {
        var res = fs.readFileSync(__dirname + "/mocks/person_search_hit.json", "UTF-8");
        testRactive.set("search_result", {results: JSON.parse(res)}).then(function () {
          expect(document.querySelectorAll(".search-result").length).to.equal(2);
          expect(document.querySelectorAll(".search-result-name")[0].innerHTML).to.equal("Test Monkey");
          expect(document.querySelectorAll(".search-result-info")[0].innerHTML).to.equal("(1944-1988)");
          done();
        }).catch(done);
      });

      it("oppdaterer riktig inputfelt med URI fra valgt søketreff", function (done) {
        var origin = "inputs.1.values.0"; // keypath for originating search field
        // selectResource event takes uri from context, and predicate and origin as parameters
        testRactive.fire("selectResource", {context: {uri: "http://192.168.50.12:7000/work/h123456" }},
          "http://192.168.50.12:7000/ontology#creator", origin);
        testRactive.update().then(function () {
          var creator = document.querySelectorAll('[data-automation-id="http://192.168.50.12:7000/ontology#creator_0"]')[0].value;
          expect(creator).to.equal("http://192.168.50.12:7000/work/h123456");
          done();
        }).catch(done);
      });
    });
  });
});
