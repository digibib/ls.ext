/*global describe, it, chai, expect */

"use strict";

var assert = require("assert"),
    chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http'),
    http = require('http'),
    cheerio = require('cheerio'),
    servicesStub = require("./services-stub");

chai.use(chaiHttp);

servicesStub.start(8080);

var parameters = {hostname: '192.168.50.50', port: '7000', path: '/'};

describe('PatronClient', function () {
    describe('/', function () {
        // FIXME tests should not use same data, and shouldn't get more data than they require
        servicesStub.getJson('/work/work_00001',
            {"id": "work_00001", "Title": "Sult", "creator": "Knut Hamsun", "date": "1890",
                "editions": [
                    {"id": "edition_00001", "isbn": "82-05-27748-6", "placement": "Voksenavdelingen, Hovedbiblioteket", "shelf": "magasinet", "status": "På hylla"},
                    {"id": "edition_00001", "isbn": "82-05-27748-6", "placement": "Voksenavdelingen, Hovedbiblioteket", "status": "På hylla"}
                ]
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

        it('should find text "Sult av Knut Hamsun (1890)"', function (done) {
            http.get(parameters, function (res) {
                var body = '',
                    $ = '';
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    $ = cheerio.load(body);
                    expect($('h1').text()).to.equal("Sult av Knut Hamsun (1890)");
                    done();
                });
            }).on('error', function (e) {
                console.log("Got error: ", e);
            });
        });
    });
});