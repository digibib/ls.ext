/*globals window*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    var Ractive = require("ractive");
    Ractive.events = require("ractive-events-keys");

    var axios = require("axios");
    var url = require("url");
    module.exports = factory(Ractive, axios, url);
  } else {
    root.Person = factory(root.Ractive, root.axios, root.url);
  }
}(this, function (Ractive, axios, url) {
  "use strict";
  Ractive.DEBUG = false;

  var Person = {

    getResourceID: function() {
      return window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    },
    init: function() {
      if (window && !window.Promise) {
        window.Promise = Ractive.Promise; // axios needs a Promise polyfill, so we use the one provided by ractive.
      }

      var config,
          person = {};
      var id = this.getResourceID();

      return axios.get("/config").then(function (response) {
        config = response.data;
      })
      .then(function() {
        return axios.get("http://" + config.host + ":" + config.port + "/person/"+id);
      })
      .then(function(response) {
        person.name = response.data["deichman:name"];
        document.title = person.name;
        if (response.data["deichman:birth"]) {
          person.birthYear = response.data["deichman:birth"]["@value"];
        }
        if (response.data["deichman:death"]) {
          person.deathYear = response.data["deichman:death"]["@value"];
        }
      })
      .then(function() {
        return axios.get("/person_template.html");
      })
      .then(function (response) {
        return response.data;
       })
      .then(function (data) {
        var personRactive = new Ractive({
          el: "#person-app",
          template: data,
          data: person
        });
        return personRactive;
      })
      .catch(function (error) {
          console.log(error);
      });
    }
  }
  return Person;

}));