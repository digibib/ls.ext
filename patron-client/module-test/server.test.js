/*global describe, it, chai, expect */

"use strict";
var assert = require("assert"),
    chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http'),
    http = require('http'),
    cheerio = require('cheerio');

chai.use(chaiHttp);

var parameters = {hostname: '192.168.50.50', port: '7000', path: '/'};

describe('PatronClient', function () {
    describe('/', function () {
        it('should return status OK', function (done) {
            chai.request('http://' + parameters.hostname + ':' + parameters.port).
                get(parameters.path).
                end(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
    describe('/', function () {
        it('should find text "Sult av Knut Hamsun"', function (done) {
            http.get(parameters, function (res) {
                var body = '',
                    $ = '';
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    $ = cheerio.load(body);
                    expect($('h1').text()).to.equal("Sult av Knut Hamsun");
                });
                done();
            }).on('error', function (e) {
                console.log("Got error: ", e);
            });
        });
    });
});