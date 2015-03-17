/*global describe, it, chai, expect */

"use strict";
var assert = require("assert"),
    chai = require("chai"),
    expect = chai.expect,
    chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('PatronClient', function () {
    describe('/', function () {
        it('should return status OK', function (done) {
            chai.request('http://192.168.50.50:7000').
                get('/').
                end(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
