/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon"),
  axios = require("axios"),
  fs = require("fs");

/*
describe("Catalinker", function () {
  describe("/Workflow", function () {

    require('./testdom')('<html><body><div id="container"/></body></html>');
    var testRactive, Main;

    before(function (done) {
      global.history = {
        replaceState: function () {

        }
      }

      // load module
      Main = require("../client/src/main.js");

      // STUBS

      // http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get").callsFake(function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: {
            kohaOpacUri: "http://koha.deichman.no",
            kohaIntraUri: "http://koha.deichman.no",
            ontologyUri: "/services/ontology",
            resourceApiUri: "/services/",
            tabs: [
              {
                id: "confirm-person",
                rdfType: "Work",
                label: "Bekreft person",
                inputs: [{rdfProperty: "creator", type: "searchable-with-result-in-side-panel"}],
                nextStep: {
                  buttonLabel: "Bekreft verk",
                  createNewResource: "Work"
                }
              }
            ],
            authorityMaintenance:[
              {
                inputs: [{
                  searchMainResource: {
                    label: 'label',
                    indexType: 'type'
                  }
                }]
              }
            ]
            
          }});
        case "/main_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/main_template.html", "UTF-8") });
        case "/services/ontology":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/ontology.json", "UTF-8") });
        case "/services/work/w123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/w123456.json", "UTF-8") });
        case "/services/person/h123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/h123456.json", "UTF-8") });
        case "/services/publication/p123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/p123456.json", "UTF-8") });
        case "/services/authorized_values/language":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_language.json", "UTF-8") });
        case "/services/authorized_values/format":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_format.json", "UTF-8") });
        case "/services/authorized_values/nationality":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/authorized_nationality.json", "UTF-8") });
        case "/services/genre/m123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/mocks/m123456.json", "UTF-8") });
        default:
          if (/^\/(partials|templates)\//.test(path)) {
            return Promise.resolve({data: fs.readFileSync(__dirname + "/../public" + path, "UTF-8") });
          } else {
            return Promise.reject({error: "not found: " + path})
          }
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
      Main.init('workflow').then(function (m) {
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
        expect(document.querySelector("h2[data-automation-id='page-heading']").innerHTML).to.equal("Katalogisering og vedlikehold av samlingen");
        done();
      });
      it("populerer med utvalgte faner fra /config", function (done) {
        var tabs = document.querySelectorAll(".grid-tabs li");
        expect(tabs.length).to.equal(2);
        expect(tabs[0].children[0].id).to.equal("tab0");
        done();
      });
    });
  });
});
*/