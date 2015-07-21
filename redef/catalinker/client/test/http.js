var server = sinon.fakeServer.create();
server.respondWith("GET", "/ok", [200, {}, JSON.stringify({ msg: "ok" })]);
server.respondWith("GET", "/nok", [500, {}, JSON.stringify({ msg: "not ok" })]);

describe("Performing HTTP requests", function () {

  describe("when server responds with a successful status code", function () {

    it("then the success callback is called", function () {
      var cbOK = sinon.spy(),
          cbNotOK = sinon.spy();

      http.get("/ok", {}, cbOK, cbNotOK);
      server.respond();
      sinon.assert.called(cbOK);
      sinon.assert.notCalled(cbNotOK);
    });

  });

  describe("when server responds with a non-successful status code", function () {

    it("then the failure callback is called", function () {
      var cbOK = sinon.spy(),
          cbNotOK = sinon.spy();

      http.get("/nok", {}, cbOK, cbNotOK);
      server.respond();
      sinon.assert.called(cbNotOK);
      sinon.assert.notCalled(cbOK);
    });

  });

  describe("when server is never reached", function () {

    it("then the failure callback is called", function () {
      var cbOK = sinon.spy(),
          cbNotOK = sinon.spy();

      http.get("http://æøå.xyz/failing/path", {}, cbOK, cbNotOK);
      server.respond();
      sinon.assert.called(cbNotOK);
      sinon.assert.notCalled(cbOK);
    });

  });

});
