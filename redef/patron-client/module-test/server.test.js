/* global require, it, describe, before */
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http'),
    http = require('http'),
    cheerio = require('cheerio'),
    servicesStub = require("./services-stub"),
    parameters = {hostname: '192.168.50.12', port: '7000', path: '/work/work_00001'},
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
          "@graph": [
            {
              "@id" : "http://deichman.no/work/work_1231",
              "@type" : "deichman:Work",
              "deichman:biblio" : "2",
              "deichman:year" : "1890",
              "deichman:name" : "Sult",
              "deichman:creator" : "Knut Hamsun",
              "@context" : {
                "deichman" : "http://deichman.no/ontology#"
              }
            },
            {
              "@id" : "http://deichman.no/publication/publication_1234",
              "@type" : "deichman:Publication",
              "deichman:format" : {
                "@id" : "http://schema.org/HardCover"
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
              "@id" : "http://schema.org/HardCover",
              "@type" : "http://schema.org/BookFormatType",
              "rdfs:label" : {
                "@language" : "no",
                "@value" : "Innbundet bok"
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
          "@graph": [
            {
              "@id" : "_:b1",
              "@type" : "deichman:Item",
              "deichman:barcode" : "12345",
              "deichman:location": "hutl",
              "deichman:status" : "AVAIL"
            }, {
              "@id" : "http://deichman.no/publication/publication_1234",
              "deichman:hasEdition" : {
                "@id" : "_:b1"
              }
            }
          ],
          "@context": {
            "deichman": "http://deichman.no/ontology#"
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

    describe('work view', function () {
      it('should display title, author, original language and date of work"', function () {
        expect($('h2[data-automation-id="work_title"]').text()).to.equal("Sult");
        expect($('span[data-automation-id="work_date"]').text()).to.equal("1890");
        expect($('p[data-automation-id="work_author"]').text()).to.equal("Knut Hamsun");
      });
    });

    describe('publication view', function () {
      it('should display formats of publication with correct labels', function () {
        expect($('td[data-automation-id=publication_format]').text()).to.equal("Innbundet bok");
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
        expect($('td[data-automation-id=item_format]').text()).to.equal("Innbundet bok");
      });

      it('should display item with label on language', function () {
        expect($('td[data-automation-id=item_language]').text()).to.equal("Engelsk, Norsk (bokmål)");
      });
    });

  });
});

