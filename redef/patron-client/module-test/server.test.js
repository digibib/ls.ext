/*jslint node: true */
/*global describe, it */

"use strict";

var chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http'),
    http = require('http'),
    cheerio = require('cheerio'),
    servicesStub = require("./services-stub");

chai.use(chaiHttp);

servicesStub.start(6666);

var parameters = {hostname: '192.168.50.12', port: '7000', path: '/work/work_00001'};

describe('PatronClient', function () {
    describe('/', function () {
        // FIXME tests should not use same data, and shouldn't get more data than they require
        servicesStub.getJson('/work/work_00001',
            {
                "@id" : "http://deichman.no/work/work_1231",
                "@type" : "http://deichman.no/ontology#Work",
                "deichman:biblio" : "2",
                "deichman:date" : "1890",
                "deichman:title" : "Sult",
                "deichman:creator" : "Knut Hamsun",
                "@context" : {
                    "deichman" : "http://deichman.no/ontology#"
                }
            }
            );

        servicesStub.getJson('/work/work_00001/items',
            {
                "@graph": [
                    {
                        "@id": "_:b1",
                        "@type": "deichman:Item",
                        "deichman:location": "hutl",
                        "deichman:status": "AVAIL"
                    },
                    {
                        "@id": "http://deichman.no/work/x0123",
                        "deichman:hasEdition": {
                            "@list": [
                                {
                                    "@id": "_:b1"
                                }
                            ]
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
                    expect(res).to.have.status(200);
                    done();
                });
        });

        it('should find text "Sult / Knut Hamsun (1890)"', function (done) {
            http.get(parameters, function (res) {
                var body = '',
                    $ = '';
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    $ = cheerio.load(body);
                    expect($('h1').text()).to.equal("Sult / Knut Hamsun (1890)");
                    done();
                });
            }).on('error', function (e) {
                console.log("Got error: ", e);
            });
        });
        it('should find item status "hutl"', function (done) {
            http.get(parameters, function (res) {
                var body = '',
                    $ = '';
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    $ = cheerio.load(body);
                    expect($('span[data-automation-id=item_location]').text()).to.equal("hutl");
                    done();
                });
            }).on('error', function (e) {
                console.log("Got error: ", e);
            });
        });
    });
});
