/*global require, it, describe, before, document*/
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    jsdom = require("mocha-jsdom");

describe("PatronClient", function () {
  describe("/search", function () {
    jsdom();
    var ractive;

    before(function (done) {
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "app");
      document.body.appendChild(fixture);

      var Search = require("../public/search.js");
      Search.then(function (r) {
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
