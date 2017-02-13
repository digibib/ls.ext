/*global window,location,ractive*/
(function (root, factory) {
  "use strict";

  if (typeof module === 'object' && module.exports) {
    var Ractive = require("ractive");
    Ractive.events = require("ractive-events-keys");
    var axios = require("axios");
    var Graph = require("./graph");
    var Ontology = require("./ontology");
    var StringUtil = require("./stringutil");
    var _ = require("underscore");

    module.exports = factory(Ractive, axios, Graph, Ontology, StringUtil, _);

  } else {
    // Browser globals (root is window)
    root.Main = factory(root.Ractive, root.axios, root.Graph, root.Ontology, root.StringUtil, root._);
  }
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _) {
  "use strict";

  Ractive.DEBUG = false;
  var ractive;

  // need to leave already parsed JSON from axios
  var ensureJSON = function (res) {
    return (typeof res === "string") ? JSON.parse(res) : res;
  };

  var proxyToServices = function (url) {
    var r = new RegExp('http://[^/]+/');
    return url.replace(url.match(r), '/services/');
  };

  String.prototype.lowerCaseFirstLetter = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
  };

  // polyfill for phantomjs
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }

  function i18nLabelValue (label) {
    if (Array.isArray(label)) {
      var value = _.find(label, function (labelValue) {
        return ("no" === labelValue[ '@language' ]);
      })[ '@value' ];
      if (value === undefined) {
        value = labelValue[ 0 ][ '@value' ];
      }
      return value;
    }
    else {
      return label[ '@value' ];
    }
  }

  /* Private functions */
  var loadExistingResource = function (uri) {
    axios.get(proxyToServices(ractive.get("config.resourceApiUri") + ractive.get("resource_type").lowerCaseFirstLetter() + "/" + uri.substr(uri.lastIndexOf("/") + 1)), {
      headers: {
        Accept: 'application/ld+json'
      }
    })
      .then(function (response) {
        ractive.set("resource_uri", uri);
        var resource;
        var graph = ensureJSON(response.data);
        // Work and Person resource gives a @graph object if attached resources, need to extract work to extract properties
        // TODO: should be rewritten to use ld-graph
        switch (ractive.get("resource_type")) {
          case "Work":
            if (graph[ "@graph" ]) {
              graph[ "@graph" ].forEach(function (g) {
                if (g[ "@type" ] === "deichman:Work") {
                  resource = g;
                  resource[ "@context" ] = graph[ "@context" ];
                }
              });
            } else {
              resource = graph;
            }
            break;
          case "Person":
            if (graph[ "@graph" ]) {
              graph[ "@graph" ].forEach(function (g) {
                if (g[ "@type" ] === "deichman:Person") {
                  resource = g;
                  resource[ "@context" ] = graph[ "@context" ];
                }
              });
            } else {
              resource = graph;
            }
            break;
          case "Publication":
            if (graph[ "@graph" ]) {
              graph[ "@graph" ].forEach(function (g) {
                if (g[ "@type" ] === "deichman:Publication") {
                  resource = g;
                  resource[ "@context" ] = graph[ "@context" ];
                }
              });
            } else {
              resource = graph;
            }
            break;
          case "Place":
            if (graph[ "@graph" ]) {
              graph[ "@graph" ].forEach(function (g) {
                if (g[ "@type" ] === "deichman:Place") {
                  resource = g;
                  resource[ "@context" ] = graph[ "@context" ];
                }
              });
            } else {
              resource = graph;
            }
            break;

          default:
            resource = graph;
        }
        var values = Ontology.extractValues(resource);

        for (var n in ractive.get("inputs")) {
          var kp = "inputs." + n;
          var input = ractive.get(kp);
          // Populate with existing values
          if (values[ input.predicate ]) {
            var idx;
            for (idx = 0; idx < values[ input.predicate ].length; idx++) {
              // If populated is searchable, it should also be deletable
              if (input.searchable) {
                values[ input.predicate ][ idx ].deletable = true;
                values[ input.predicate ][ idx ].searchable = false;
              }
              var value = values[ input.predicate ][ idx ]
              if (!/^_:.*/.test(value.current.value)) {
                ractive.set(kp + ".values." + idx, value);
              }
            }
          }
        }

        ractive.set("save_status", "åpnet eksisterende ressurs");
      })
      .catch(function (err) {
        console.log("HTTP GET existing resource failed with:");
        console.log(err);
      });
  };

  var createNewResource = function () {
    // fetch URI for new resource
    axios.post(ractive.get("config.resourceApiUri") + ractive.get("resource_type").lowerCaseFirstLetter(),
      {}, { headers: { Accept: "application/ld+json", "Content-Type": "application/ld+json" } })
      .then(function (response) {
        // now that the resource exists - redirect to load the new resource
        window.location.replace(location.href + "?resource=" + response.headers.location);
      })
      .catch(function (err) {
        console.log("POST to " + ractive.get("resource_type").lowerCaseFirstLetter() + " fails: " + err);
      });
  };

  var loadAuthorizedValues = function (url, predicate) {

    axios.get(proxyToServices(url), {
      headers: {
        Accept: 'application/ld+json'
      }
    })
      .then(function (response) {
        var values = ensureJSON(response.data);
        // resolve all @id uris
        values[ "@graph" ].forEach(function (v) {
          v[ "@id" ] = Ontology.resolveURI(values, v[ "@id" ]);
        });

        var values_sorted = values[ "@graph" ].sort(function (a, b) {
          if (a[ "label" ][ "@value" ] < b[ "label" ][ "@value" ]) {
            return -1;
          }
          if (a[ "label" ][ "@value" ] > b[ "label" ][ "@value" ]) {
            return 1;
          }
          return 0;
        });
        ractive.set("authorized_values." + predicate.split(":")[ 1 ], values_sorted);
      })
      .catch(function (err) {
        console.log("GET authorized values error: " + err);
      });
  };

  var onOntologyLoad = function (ont) {

    var props = Ontology.propsByClass(ont, ractive.get("resource_type")),
      inputs = [];
    ractive.set("ontology", ont);

    ractive.set("resource_label", Ontology.resourceLabel(ont, ractive.get("resource_type"), "no").toLowerCase());

    for (var i = 0; i < props.length; i++) {
      var disabled = false;
      if (props[ i ][ "http://data.deichman.no/ui#editable" ] !== undefined && props[ i ][ "http://data.deichman.no/ui#editable" ] !== true) {
        disabled = true;
      }

      // Fetch authorized values, if required
      if (props[ i ][ "http://data.deichman.no/utility#valuesFrom" ]) {
        var url = props[ i ][ "http://data.deichman.no/utility#valuesFrom" ][ "@id" ];
        loadAuthorizedValues(url, props[ i ][ "@id" ]);
      }
      var ranges = props[ i ][ "rdfs:range" ];
      var datatype = _.isArray(ranges) ? ranges[ 0 ][ "@id" ] : ranges[ "@id" ];
      var predicate = Ontology.resolveURI(ont, props[ i ][ "@id" ]);
      var input = {
        disabled: disabled,
        searchable: props[ i ][ "http://data.deichman.no/ui#searchable" ] ? true : false,
        predicate: predicate,
        fragment: predicate.substring(predicate.lastIndexOf("#") + 1),
        authorized: props[ i ][ "http://data.deichman.no/utility#valuesFrom" ] ? true : false,
        range: datatype,
        datatype: datatype,
        label: i18nLabelValue(props[ i ][ "rdfs:label" ]),
        values: [ {
          old: { value: "", lang: "" },
          current: { value: "", lang: "" }
        } ]
      };

      if (input.searchable) {
        input.type = "input-string-searchable";
        input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
      } else if (input.authorized) {
        input.type = "select-authorized-value";
        input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
      } else {
        switch (input.range) {
          case "http://www.w3.org/2001/XMLSchema#string":
            input.type = "input-string";
            break;
          case 'http://www.w3.org/2001/XMLSchema#boolean':
            input.type = 'input-boolean'
            break
          case "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString":
            input.type = "input-lang-string";
            break;
          case "http://www.w3.org/2001/XMLSchema#gYear":
            input.type = "input-gYear";
            break;
          case "http://www.w3.org/2001/XMLSchema#nonNegativeInteger":
            input.type = "input-nonNegativeInteger";
            break;
          case 'http://data.deichman.no/utility#duration':
            input.type = 'input-duration'
            break
          case 'http://www.w3.org/2001/XMLSchema#dateTime':
            input.type = 'input-string'
            break
          case "deichman:Work":
          case "deichman:Person":
          case "deichman:Place":
          case "deichman:Corporation":
          case 'deichman:PublicationPart':
          case "deichman:Genre":
          case 'deichman:CompositionType':
          case 'deichman:Instrument':
          case 'deichman:ClassificationSource':
          case 'deichman:WorkSeries' :
          case 'deichman:Event' :
            // TODO infer from ontology that this is an URI
            // (because deichman:Work a rdfs:Class)
            input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
            input.type = "input-string"; // temporarily
            break;
          case "deichman:Contribution": //ignore, as these are blank nodes
          case "deichman:SerialIssue":
          case "deichman:Subject":
          case 'deichman:WorkRelation':
          case 'deichman:Instrumentation':
          case 'deichman:ClassificationEntry':
          case 'deichman:WorkSeriesPart':
            break;
          //default:
          //  throw "Doesn't know which input-type to assign to range: " + input.range;
        }
      }
      inputs.push(input);
    }

    ractive.set("inputs", inputs);

    // If resource URI is given in query string, it will be loaded for editing, otherwise we will
    // request a new URI for working on a new resource.
    var uri = Main.getURLParameter("resource");
    if (uri) {
      loadExistingResource(uri);
    } else {
      createNewResource();
    }
  };

  /* public API */
  var Main = {
    getResourceType: function () {
      return StringUtil.titelize(location.pathname.substr(location.pathname.lastIndexOf("/") + 1));
    },
    getURLParameter: function (name) {
      // http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(location.search);
      return results === null ? null : results[ 1 ];
    },
    init: function () {
      var config;
      window.onerror = function (message, url, line) {
        // Log any uncaught exceptions to assist debugging tests.
        // TODO remove this when everything works perfectly (as if...)
        console.log('ERROR: "' + message + '" in file: ' + url + ', line: ' + line);
      };

      // axios and phantomjs needs a Promise polyfill, so we use the one provided by ractive.
      if (window && !window.Promise) {
        window.Promise = Ractive.Promise;
      }

      var errors = [];

      // Start initializing - return a Promise
      return axios.get("/config")
        .then(function (response) {
          config = ensureJSON(response.data);
          return;
        })
        .then(function () {
          return axios.get("/main_template_old.html");
        })
        .then(function (response) {
          // Initialize ractive component from template
          ractive = new Ractive({
            el: "#container",
            lang: "no",
            template: response.data,
            data: {
              readOnly: window.location.href.indexOf("readOnly") != -1,
              authorized_values: {},
              getAuthorizedValues: function (fragment) {
                return ractive.get("authorized_values." + fragment);
              },
              getRdfsLabelValue: function (rdfsLabel) {
                if (Array.isArray(rdfsLabel)) {
                  var value;
                  rdfsLabel.forEach(function (label) {
                    if (label[ '@language' ]) {
                      value = label[ '@value' ];
                    }
                  });
                  return value;
                }
                else {
                  return rdfsLabel[ '@value' ];
                }
                return false;
              },
              errors: errors,
              resource_type: "",
              resource_label: "",
              resource_uri: "",
              inputs: {},
              ontology: null,
              search_result: null,
              config: config,
              save_status: "ny ressurs"
            }
          });
          // Find resource type from url path
          ractive.set("resource_type", Main.getResourceType());

          ractive.on({
            countdownToSave: function (event) {
              // TODO find better name to this function
              if (event.context.current.value === "" && event.context.old.value === "") {
                return;
              }
              ractive.set("save_status", "arbeider...");
            },
            // addValue adds another input field for the predicate.
            addValue: function (event) {
              ractive.get(event.keypath).values.push({
                old: { value: "", lang: "" },
                current: { value: "", lang: "" }
              });
            },
            // patchResource creates a patch request based on previous and current value of
            // input field, and sends this to the backend.
            patchResource: function (event, predicate) {
              if (event.context.error || (event.context.current.value === "" && event.context.old.value === "")) {
                return;
              }
              var datatype = event.keypath.substr(0, event.keypath.indexOf("values")) + "datatype";
              var patch = Ontology.createPatchAsString(ractive.get("resource_uri"), predicate, event.context, ractive.get(datatype));
              if (patch.trim() != "") {
                axios.patch(proxyToServices(ractive.get('resource_uri')), patch, {
                  headers: {
                    Accept: "application/ld+json",
                    "Content-Type": "application/ldpatch+json"
                  }
                })
                  .then(function (response) {
                    // successfully patched resource

                    // keep the value in current.old - so we can do create delete triple patches later
                    var cur = ractive.get(event.keypath + ".current");
                    ractive.set(event.keypath + ".old.value", cur.value);
                    ractive.set(event.keypath + ".old.lang", cur.lang);

                    ractive.set("save_status", "alle endringer er lagret");
                  })
                  .catch(function (response) {
                    // failed to patch resource
                    console.log("HTTP PATCH failed with: ", response);
                    errors.push("Noe gikk galt! Fikk ikke lagret endringene");
                  });
              }
            },
            searchResource: function (event, predicate, searchString) {
              // TODO: searchType should be deferred from predicate, fetched from ontology by rdfs:range
              var searchType = "person";
              var searchURI = ractive.get("config.resourceApiUri") + "search/" + searchType + "/_search/?q=" + searchString;
              axios.get(proxyToServices(searchURI))
                .then(function (response) {
                  var results = ensureJSON(response.data);
                  ractive.set("search_result", { origin: event.keypath, predicate: predicate, results: results });
                }).catch(function (err) {
                console.log(err);
              });
            },
            selectResource: function (event, predicate, origin) {
              // selectResource takes origin as param, as we don't know where clicked search hits comes from
              var uri = event.context.uri;
              ractive.set(origin + ".old.value", ractive.get(origin + ".current.value"));
              ractive.set(origin + ".current.value", uri);
              ractive.set(origin + ".deletable", true);
              ractive.set(origin + ".searchable", false);
              ractive.update();
              ///patchResource takes event.keypath and event.context, and predicate as param
              ractive.fire("patchResource", { keypath: origin, context: ractive.get(origin) }, predicate);
            },
            delResource: function (event, predicate) {
              ractive.set(event.keypath + ".current.value", "");
              ractive.set(event.keypath + ".deletable", false);
              ractive.set(event.keypath + ".searchable", true);
              ractive.update();
              ractive.fire("patchResource", { keypath: event.keypath, context: event.context }, predicate);
            }
          });

          // Observing input for instant validation:
          ractive.observe("inputs.*.values.*", function (newValue, oldValue, keypath) {
            if (newValue.current.value === "") {
              ractive.set(keypath + ".error", false);
              return;
            }
            var parent = keypath.substr(0, keypath.substr(0, keypath.lastIndexOf(".")).lastIndexOf("."));
            var valid = false;
            try {
              valid = Ontology.validateLiteral(newValue.current.value, ractive.get(parent).range);
            } catch (e) {
              console.log(e);
              return;
            }
            if (valid) {
              ractive.set(keypath + ".error", false);
            } else {
              ractive.set(keypath + ".error", "ugyldig input");
            }
          });

          return ractive;
        })
        .catch(function (err) {
          console.log("Error initiating ractive template: " + err);
        });
    },
    loadOntology: function () {
      return axios.get(proxyToServices(ractive.get("config.ontologyUri")), {
        headers: {
          Accept: 'application/ld+json'
        }
      })
        .then(function (response) {
          return onOntologyLoad(ensureJSON(response.data));
        }).catch(function (err) {
          console.log("Error loading ontology: " + err);
        });
    },
    getRactive() {
      return ractive;
    }
  };

  return Main;
}));
