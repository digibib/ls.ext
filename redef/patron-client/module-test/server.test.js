/*global require, it, describe */
"use strict";

var chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http'),
    http = require('http'),
    cheerio = require('cheerio'),
    servicesStub = require("./services-stub"),
    parameters = {hostname: '192.168.50.12', port: '7000', path: '/work/work_00001'};

chai.use(chaiHttp);

servicesStub.start(6666);

describe('PatronClient', function () {
  describe('/', function () {
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
                  "deichman:format" : "bok",
                  "deichman:language" : "engelsk",
                  "deichman:publicationOf" : "http://deichman.no/work/work_1231",
                  "deichman:name" : [{
                    "@language" : "sv",
                    "@value" : "Hungrig"
                  }]
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
                    "@list" : [{
                      "@id" : "_:b1"
                    }]
                  }
                }
              ],
              "@context": {
                "deichman": "http://deichman.no/ontology#"
              }
            }
    );


    it('should return status OK', function (done) {
      chai.request('http://' + parameters.hostname + ':' + parameters.port).
          get(parameters.path).
                end(function (err, res) {
                  expect(err).to.equal(null);
                  expect(res.status).to.equal(200);
                  done();
                });
    });

    it('should find title, author and date of work"', function (done) {
      http.get(parameters, function (res) {
        var body = '',
            $ = '';
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          $ = cheerio.load(body);
          expect($('h2[data-automation-id="work_title"]').text()).to.equal("Sult");
          expect($('span[data-automation-id="work_date"]').text()).to.equal("1890");
          expect($('p[data-automation-id="work_author"]').text()).to.equal("Knut Hamsun");
          done();
        });
      }).on('error', function (e) {
        console.log("Got error: ", e);
      });
    });
    it('should find item location "hutl"', function (done) {
      http.get(parameters, function (res) {
        var body = '',
            $ = '';
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          $ = cheerio.load(body);
          expect($('td[data-automation-id=item_location]').text()).to.equal("hutl");
          done();
        });
      }).on('error', function (e) {
        console.log("Got error: ", e);
      });
    });
  });
});
