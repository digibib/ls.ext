var FakePromise = function () {
  return {
    get: function (path) {
      if (path === "/ok") {
        return {
          then: function (resolve) {
            return resolve(JSON.stringify({ msg: "ok" }));
          }
        };
      } else {
        return {
          then: function () {
            return this;
          },
          catch: function (reject) {
            return reject(JSON.stringify({ msg: "not ok" }));
          }
        };
      }
    }
  };
};

define(['http'], function (http) {

  describe("Performing HTTP requests", function () {

    sinon.stub(http, "get", FakePromise().get);

    describe("when server responds with a successful status code", function () {
      it("then it returns a resolved promise", function (done) {
        http.get("/ok", {}).then(function (response) {
          expect(response).to.deep.equal(JSON.stringify({ msg: "ok" }));
          done();
        });
      });

    });

    describe("when server responds with a non-successful status code", function () {
      it("then it returns a rejected promise", function (done) {
        http.get("/nok", {}).then().catch(function (err) {
          expect(err).to.deep.equal(JSON.stringify({ msg: "not ok" }));
          done();
        });
      });
    });

    describe("when server is never reached", function () {
      it("then it returns a rejected promise", function (done) {
        http.get("http://æøå.xyz/failing/path", {}).then().catch(function (err) {
          expect(err).to.deep.equal(JSON.stringify({ msg: "not ok" }));
          done();
        });
      });
    });
  });

});
