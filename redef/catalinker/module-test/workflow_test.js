/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs");

describe("Catalinker", function () {
  describe("/Workflow", function () {

    require('./testdom')('<html><body><div id="container"/></body></html>');
    var testRactive, Main;

    before(function (done) {

      // load module
      Main = require("../client/src/main.js");

      // STUBS

      // http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: {
            kohaOpacUri: "http://koha.deichman.no",
            kohaIntraUri: "http://koha.deichman.no",
            ontologyUri: "http://192.168.50.12:7000/ontology",
            resourceApiUri: "http://192.168.50.12:7000/",
            tabs: [
              {
                id: "confirm-person",
                rdfType: "Work",
                label: "Bekreft person",
                inputs: [{rdfProperty: "creator", type: "searchable-person"}],
                nextStep: {
                  buttonLabel: "Bekreft verk",
                  createNewResource: "Work"
                }
              }
            ]
          }});
        case "/main_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/main_template.html", "UTF-8") });
        case "http://192.168.50.12:7000/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "http://192.168.50.12:7000/work/w123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/w123456.json", "UTF-8") });
        case "http://192.168.50.12:7000/person/h123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/h123456.json", "UTF-8") });
        case "http://192.168.50.12:7000/publication/p123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/p123456.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/language":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_language.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/format":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_format.json", "UTF-8") });
        case "http://192.168.50.12:7000/authorized_values/nationality":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_nationality.json", "UTF-8") });
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

      // load module
      Main.init().then(function (m) {
        testRactive = Main.getRactive();
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
      done();
    });

    describe("Verksside", function () {

      it("har riktig side-tittel", function (done) {
        //console.log(document.body.innerHTML);
        expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering av utgivelse");
        done();
      });
      it("populerer med utvalgte faner fra /config", function (done) {
        var tabs = document.querySelectorAll(".grid-tabs li");
        expect(tabs.length).to.equal(1);
        expect(tabs[0].children[0].id).to.equal("confirm-person-tab");
        expect(tabs[0].children[0].innerHTML).to.equal("Bekreft person");
        done();
      });
      it("populerer faner med gruppert innhold fra ontologi", function (done) {
        var tabContent = document.querySelectorAll(".inner-content div.grid-panel");
        expect(tabContent.length).to.equal(1);
        expect(tabContent[0].querySelector(".label").innerHTML).to.equal("Opphavsperson");
        expect(tabContent[0].querySelector("input").getAttribute("data-automation-id")).to.equal("Work_http://192.168.50.12:7000/ontology#creator_0");
        expect(tabContent[0].querySelector("button.next-step-button").innerHTML).to.equal("Bekreft verk");
        done();
      });
      it("bruker Ractive til å legge til faner", function (done) {
        var testPane = {
          tabLabel: "Test Tab",
          tabId: "testid"
        };
        testRactive.set("inputGroups", [testPane]).then(function () {
          var tabs = document.querySelectorAll(".grid-tabs li");
          expect(tabs.length).to.equal(1);
          expect(tabs[0].children[0].id).to.equal("testid-tab");
          expect(tabs[0].children[0].innerHTML).to.equal("Test Tab");
          done();
        }).catch(done);
      });
    });
  });
});
