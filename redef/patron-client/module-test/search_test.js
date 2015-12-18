/*global require, it, describe, before, after, document, Promise*/
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    axios = require("axios"),
    fs = require("fs"),
    jsdom = require("mocha-jsdom");

describe("PatronClient", function () {
  describe("/search", function () {
    jsdom();
    var ractive, Search;

    before(function (done) {

      // load module
      Search = require("../client/src/search.js");

      // stub http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {
        switch (path) {
        case "/config":
          return Promise.resolve({data: { host: "192.168.50.12", port: 7000 }});
        case "/search_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../public/search_template.html", "UTF-8") });
        }
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "search-app");
      document.body.appendChild(fixture);

      // load module
      Search.init().then(function (r) {
        ractive = r;
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    after(function () {
      axios.get.restore();
    });

    it("should display opening message", function (done) {
      ractive.set("hits", null).then(function () {
        expect(document.querySelector("[data-automation-id='no-search']").innerHTML).to.eq("Søk etter verk");
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it("should report lack of hits following search", function (done) {
      ractive.set("currentSearchTerm", "nohits");
      ractive.set("hits.total", 0).then(function () {
        expect(document.querySelector("[data-automation-id='current-search-term']").innerHTML).to.eq("nohits");
        expect(document.querySelector("[data-automation-id='hits-total']").innerHTML).to.eq("0");
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it("should display total number of search hits", function (done) {
      ractive.set("currentSearchTerm", "should display total number of search hits");
      ractive.set("hits.total", 1).then(function () {
        expect(document.querySelector("[data-automation-id='hits-total']").innerHTML).to.eq("1");
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it("should display title of all hits", function (done) {
      ractive.set("currentSearchTerm", "should display title of all hits");
      var hits = {
        "hits": [
            {
              "_id": "http//example.org/work/1",
              "_source": {
                "work": {
                  "mainTitle": "Tittel 1"
                }
              }
            },
            {
              "_id": "http//example.org/work/2",
              "_source": {
                "work": {
                  "mainTitle": "Tittel 2"
                }
              }
            },
            {
              "_id": "http//example.org/work/3",
              "_source": {
                "work": {
                  "mainTitle": "æøå"
                }
              }
            }
        ],
        "total": 3
      };
      ractive.set("hits", hits).then(function () {
        var results = document.getElementsByClassName("result"),
            titles = [],
            want = hits.hits.map(function (h) {
              return h._source.work.mainTitle;
            });

        [].forEach.call(results, function (el) {
          titles.push(el.querySelector("[data-automation-id='work-title']").innerHTML);
        });

        expect(document.querySelector("[data-automation-id='hits-total']").innerHTML).to.eq(hits.total.toString());
        expect(titles).to.eql(want);

        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });

});
