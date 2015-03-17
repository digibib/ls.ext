/*global describe, it, chai, expect */

"use strict";
var assert = require("assert"),
    chai = require("chai"),
    chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('PatronClient', function () {
    describe('#root()', function () {
        it('should return hello world', function () {
            chai.request('http://192.168.50.50:7000').
                get('/').
                end(function (err, res) {
                    expect(err).to.be.null();
                    expect(res).to.have.status(200);
                });
        });
    });
});
