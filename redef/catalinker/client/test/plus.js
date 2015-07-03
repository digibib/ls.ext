var mylib = require('../lib/catalinker.js'),
    assert = require('assert');


describe("Plus function", function() {
  it("adds two numbers", function() {
    assert.equal(mylib.plus(1,2), 3);
  });
});