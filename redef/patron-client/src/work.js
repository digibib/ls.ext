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
    root.Search = factory(root.Ractive, root.axios, root.url, root.graph);
  }
}(this, function (Ractive, axios, url, graph) {
  "use strict";
  Ractive.DEBUG = false;

  if (window && !window.Promise) {
    window.Promise = Ractive.Promise; // axios needs a Promise polyfill, so we use the one provided by ractive.
  }

  var config,
      id = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1),
      work_response,
      items_response,
      work_graph;

  return axios.get("/config").then(function (response) {
    config = response.data;
  })
  .then(function () {
    return axios.get("http://" + config.host + ":" + config.port + "/work/"+id);
  })
  .then(function (response) {
    work_response = response.data;
    return axios.get("http://" + config.host + ":" + config.port + "/work/"+id+"/items");
  })
  .then(function (response) {
    items_response = response.data;
  })
  .catch(function (error) {
    console.log("work items: " + error.statusText);
  })
  .then(function (response) {
    if (items_response) {
      work_graph = graph.parse(work_response, items_response);
    } else {
      work_graph = graph.parse(work_response);
    }
    if (work_graph.byType("Work")[0].getAll("name").length > 0 ) {
      // TODO add to ld-graph API: resource.has("name") => true/false
      document.title = work_graph.byType("Work")[0].get("name").value;
    }
  })
  .then(function () {
    return axios.get("/work_template.html").then(function (response) {
      return response.data;
    });
  }).then(function (data) {
    var workRactive = new Ractive({
      el: "#work-app",
      template: data,
      data: {
        graph: work_graph,
        work: work_graph.byId("http://" + config.host + ":" + config.port + "/work/"+id),
        availCount: function(items) {
          return items.filter(function(item) {
            return item.get("status").value === "AVAIL"
          }).length;
        },
        linkify: function(uri) {
          var found = false;
          for (var i = uri.length; i>0; i--) {
            if (uri[i] == '/') {
              if (found) {
                return uri.substring(i);
              }
              found = true;
            }
          }
          throw new Error("cannot linkify: " + uri);
        }
      },
    });

    return workRactive;
  }).catch(function (error) {
    console.log(error);
  });
}));