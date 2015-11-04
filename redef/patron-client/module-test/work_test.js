/*global require, it, describe, before, after, document, Promise, Work*/
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    axios = require("axios"),
    fs = require("fs"),
    jsdom = require("mocha-jsdom");

describe("PatronClient", function () {
  describe("/work", function () {
    jsdom();
    var ractive, Work;

    before(function (done) {

      // load module
      Work = require("../src/work.js");

      // stub ID returned from window.location
      sinon.stub(Work, "getResourceID", function () {
        return "w123456";
      });

      // stub http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {

        switch (path) {
        case "/config":
          return Promise.resolve({data: { host: "192.168.50.12", port: 7000 }});
        case "/work_template.html":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../src/work_template.html", "UTF-8"), status: 200 });
        case "http://192.168.50.12:7000/work/w123456":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../module-test/w123456.json", "UTF-8"), status: 200});
        case "http://192.168.50.12:7000/work/w123456/items":
          return Promise.resolve({data: fs.readFileSync(__dirname + "/../module-test/w123456items.json", "UTF-8"), status: 200 });
        }
      });

      // create fixtures for testing Ractive events
      var fixture = document.createElement("div");
      fixture.setAttribute("id", "work-app");
      document.body.appendChild(fixture);

      // load module
      Work.init().then(function (w) {
        ractive = w;
        done();
      }).catch(function (err) {
        done(err);
      });

    });

    after(function () {
      axios.get.restore();
      Work.getResourceID.restore();
    });

    it("should get work ID from window.location", function () {
      expect(Work.getResourceID()).to.eq("w123456");
    });

    it("should display title, author, original language and date of work", function (done) {
      expect(document.querySelector("[data-automation-id='work_title']").innerHTML).to.equal("Sult");
      expect(document.querySelector("[data-automation-id='work_date']").innerHTML).to.equal("1890");
      expect(document.querySelector("[data-automation-id='work_author']").innerHTML).to.equal('<a href="/person/h123456">Knut Hamsun</a>');
      done();
    });

    describe('publication view', function () {
      it('should display formats of publication with correct labels', function () {
        expect(document.querySelector("[data-automation-id='publication_format']").innerHTML).to.equal("Bok");
      });

      it('should display languages of publication with correct labels', function () {
        expect(document.querySelector("[data-automation-id='publication_language']").innerHTML).to.equal("Engelsk");
      });
    });

    describe('edition view', function () {
      it('should display item location', function () {
        expect(document.querySelector("[data-automation-id='item_location']").innerHTML).to.equal("hutl");
      });

      it('should display item with label on format', function () {
        expect(document.querySelector("[data-automation-id='item_format']").innerHTML).to.equal("Bok");
      });

      it('should display item with label on language', function () {
        expect(document.querySelector("[data-automation-id='item_language']").innerHTML).to.equal("Engelsk");
      });

      it('should display item with label for shelfmark', function () {
        expect(document.querySelector("[data-automation-id='item_shelfmark']").innerHTML).to.equal("80 Doc");
      });
    });
  });

});
