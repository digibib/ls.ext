/*global assert*/
define(['string'], function (string) {

  describe("Working with strings", function () {
    it("can titelize a string", function () {
      assert.equal(string.titelize("uten tittel"), "Uten tittel");
    });
  });

});
