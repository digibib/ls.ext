/*globals window*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    var Ractive = require("ractive");
    Ractive.events = require("ractive-events-keys");

    var axios = require("axios");
    var url = require("url");
    var graph = require("ld-graph");

    module.exports = factory(Ractive, axios, url, graph);
  } else {
    root.Person = factory(root.Ractive, root.axios, root.url, root.graph);
  }
}(this, function (Ractive, axios, url, graph) {
  "use strict";
  Ractive.DEBUG = false;

  var ensureJSON = function (res) {
    return (typeof res === "string") ? JSON.parse(res) : res;
  };

  var Person = {

    getResourceID: function() {
      return window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    },
    init: function() {
      if (window && !window.Promise) {
        window.Promise = Ractive.Promise; // axios needs a Promise polyfill, so we use the one provided by ractive.
      }

      var config,
          person,
          works,
          id = this.getResourceID();

      return axios.get("/config")
      .then(function (response) {
        config = ensureJSON(response.data);
      })
      .then(function() {
        id = "http://" + config.host + ":" + config.port + "/person/"+id;
        return axios.get(id+"/works");
      })
      .then(function(response) {
        works = ensureJSON(response.data);
      })
      .catch(function(error) {
        if (error.status == 404) {
          console.log("person has no connected works");
        } else {
          throw new Error(error);
        }
      })
      .then(function() {
        return axios.get(id);
      })
      .then(function(response) {
        var h = ensureJSON(response.data);
        if (works) {
          person = graph.parse(works, h);
        } else {
          person = graph.parse(h);
        }
        if (person.byId(id).getAll("name")) {
          document.title = person.byId(id).get("name").value;
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
          data: {
            person: person.byId(id),
            works: person.byType("Work"),
            linkify: function(uri) {
              var found = false;
              var i;
              for (i = uri.length; i>0; i--) {
                if (uri[i] == '/') {
                  if (found) {
                    return uri.substring(i);
                  }
                  found = true;
                }
              }
              throw new Error("cannot linkify: " + uri);
            }
          }
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