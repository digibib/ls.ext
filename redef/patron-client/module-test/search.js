/*global require, it, describe, before, document, Promise*/
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
    var ractive;

    before(function (done) {

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
      fixture.setAttribute("id", "app");
      document.body.appendChild(fixture);

      // load module
      require("../src/search.js").then(function (r) {
        ractive = r;
        done();
      }).catch(done);
    });

    it("should display total number of search hits", function (done) {
      ractive.set("hits.total", 1).then(function () {
        expect(document.querySelector("[data-automation-id='hits-total']").innerHTML).to.eq("1");
        done();
      }).catch(done);
    });

    it("should display name of all hits", function (done) {
      var hits = {
        "hits": [
            {
              "_id": "http//example.org/work/1",
              "_source": {
                "name": "Tittel 1"
              }
            },
            {
              "_id": "http//example.org/work/2",
              "_source": {
                "name": "Tittel 2"
              }
            },
            {
              "_id": "http//example.org/work/3",
              "_source": {
                "name": "æøå"
              }
            }
        ],
        "total": 3
      };
      ractive.set("hits", hits).then(function () {
        var results = document.getElementsByClassName("result"),
            titles = [],
            want = hits.hits.map(function (h) {
              return h._source.name;
            });

        [].forEach.call(results, function (el) {
          titles.push(el.querySelector("[data-automation-id='work-name']").innerHTML);
        });

        expect(document.querySelector("[data-automation-id='hits-total']").innerHTML).to.eq(hits.total.toString());
        expect(titles).to.eql(want);

        done();
      }).catch(done);
    });

  });

});
