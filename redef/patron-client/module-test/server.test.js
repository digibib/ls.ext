/* global require, it, describe, before */
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http'),
    http = require('http'),
    cheerio = require('cheerio'),
    servicesStub = require("./services-stub"),
    parameters = {
      hostname: process.env.PATRON_CLIENT_SERVER_HOST || '192.168.50.12',
      port: process.env.PATRON_CLIENT_SERVER_PORT || '7000',
      path: '/work/work_00001'
    },
    $ = '';

chai.use(chaiHttp);

servicesStub.start(6666);

describe('PatronClient', function () {
  describe('/', function () {

    before(function (done) {
      // FIXME tests should not use same data, and shouldn't get more data than they require
      servicesStub.getJson('/', {});
      servicesStub.getJson('/work/work_00001',
        {
          "@context" : {
            "deichman" : "http://deichman.no/ontology#",
            "rdfs" : "http://www.w3.org/2000/01/rdf-schema#",
            "xsd" : "http://www.w3.org/2001/XMLSchema#"
          },
          "@graph": [
            {
              "@id" : "http://deichman.no/work/work_1231",
              "@type" : "deichman:Work",
              "deichman:biblio" : "2",
              "deichman:year" : "1890",
              "deichman:name" : "Sult",
              "deichman:creator" : {
                "@id": "http://deichman.no/person/h998496193265"
              }
            },
            {
              "@id" : "http://deichman.no/person/h998496193265",
              "@type" : "deichman:Person",
              "deichman:birth" : {
                "@type" : "xsd:gYear",
                "@value" : "1859"
              },
              "deichman:death" : {
                "@type" : "xsd:gYear",
                "@value" : "1952"
              },
              "deichman:name" : "Knut Hamsun"
            },
            {
              "@id" : "http://deichman.no/publication/publication_1234",
              "@type" : "deichman:Publication",
              "deichman:format" : {
                "@id" : "http://data.deichman.no/format#Book"
              },
              "deichman:publicationOf" : {
                "@id": "http://deichman.no/work/work_1231"
              },
              "deichman:language" : [{
                "@id" : "http://lexvo.org/id/iso639-3/eng"
              }, {
                "@id" : "http://lexvo.org/id/iso639-3/nob"
              }],
              "deichman:name" : [{
                "@language" : "sv",
                "@value" : "Hungrig"
              }]
            }, {
              "@id" : "http://data.deichman.no/format#Book",
              "@type" : "http://data.deichman.no/utility#Format",
              "rdfs:label" : {
                "@language" : "no",
                "@value" : "Bok"
              }
            }, {
              "@id" : "http://lexvo.org/id/iso639-3/eng",
              "@type" : "http://lexvo.org/ontology#Language",
              "rdfs:label" : {
                "@language" : "no",
                "@value" : "Engelsk"
              }
            }, {
              "@id" : "http://lexvo.org/id/iso639-3/nob",
              "@type" : "http://lexvo.org/ontology#Language",
              "rdfs:label" : {
                "@language" : "no",
                "@value" : "Norsk (bokmål)"
              }
            }
          ]
        }
      );

      servicesStub.getJson('/work/work_00001/items',
        {
          "@context": {
            "deichman": "http://deichman.no/ontology#"
          },
          "@id" : "http://deichman.no/exemplar/e_1234",
          "@type" : "deichman:Item",
          "deichman:barcode" : "12345",
          "deichman:location": "hutl",
          "deichman:status" : "AVAIL",
          "deichman:onloan" : false,
          "http://data.deichman.no/utility#shelfmark" : "820 Doh",
          "deichman:editionOf": {
            "@id": "http://deichman.no/publication/publication_1234"
          }
        }
      );

      http.get(parameters, function (res) {
        var body = '';
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          $ = cheerio.load(body);
          done();
        });
      }).on('error', function (e) {
        console.log("Got error: ", e);
      });
    });

    it('should return status OK', function (done) {
      chai.request('http://' + parameters.hostname + ':' + parameters.port)
        .get(parameters.path)
        .end(function (err, res) {
          expect(err).to.equal(null);
          expect(res.status).to.equal(200);
          done();
        });
    });

    /*describe('work view', function () {
      it('should display title, author, original language and date of work"', function () {
        expect($('h2[data-automation-id="work_title"]').text()).to.equal("Sult");
        expect($('span[data-automation-id="work_date"]').text()).to.equal("1890");
        expect($('p[data-automation-id="work_author"]').text()).to.equal("Knut Hamsun");
      });
    });

    describe('publication view', function () {
      it('should display formats of publication with correct labels', function () {
        expect($('td[data-automation-id=publication_format]').text()).to.equal("Bok");
      });

      it('should display languages of publication with correct labels', function () {
        expect($('td[data-automation-id=publication_language]').text()).to.equal("Engelsk, Norsk (bokmål)");
      });
    });

    describe('edition view', function () {
      it('should display item location', function () {
        expect($('td[data-automation-id=item_location]').text()).to.equal("hutl");
      });

      it('should display item with label on format', function () {
        expect($('td[data-automation-id=item_format]').text()).to.equal("Bok");
      });

      it('should display item with label on language', function () {
        expect($('td[data-automation-id=item_language]').text()).to.equal("Engelsk, Norsk (bokmål)");
      });

      it('should display item with label for shelfmark', function () {
        expect($('td[data-automation-id=item_shelfmark]').text()).to.equal("820 Doh");
      });
    });
    */

  });
});

