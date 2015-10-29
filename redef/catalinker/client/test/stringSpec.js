var assert = require('chai').assert;
var StringUtil = require('../src/stringutil');

describe("Working with strings", function () {
  it("can titelize a string", function () {
    assert.equal(StringUtil.titelize("uten tittel"), "Uten tittel");
  });
});
