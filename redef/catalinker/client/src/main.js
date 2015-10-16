define(['graph', 'http', 'ontology', 'string'], function (graph, http, ontology, string) {

  window.onerror = function (message, url, line) {
    // Log any uncaught exceptions to assist debugging tests.
    // TODO remove this when everything works perfectly (as if...)
    console.log('ERROR: "' + message + '" in file: ' + url + ', line: ' + line);
  };

  // TODO move this function out and test it!
  function getURLParameter(name) {
    // http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(location.search);
    return results === null ? null : results[1];
  }


  Ractive.DEBUG = false;

  var errors = [];
  var ractive = new Ractive({
     el: "#container",
     lang: "no",
     template: "#template",
     data: {
       authorized_values: {},
       errors: errors,
       resource_type: "",
       resource_label: "",
       resource_uri: "",
       inputs: {},
       ontology: null,
       config: {},
       save_status: "ny ressurs"
     }
   });

  // Event handling functions responding to UI interactions:
  listener = ractive.on({
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
      var patch = ontology.createPatch(ractive.get("resource_uri"), predicate, event.context, ractive.get(datatype));
      http.patch(ractive.get("resource_uri"),
        {"Accept": "application/ld+json", "Content-Type": "application/ldpatch+json"},
        patch)
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
          console.log("HTTP PATCH failed with: ");
          console.log(response);

          errors.push("Noe gikk galt! Fikk ikke lagret endringene");
        });
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
      valid = ontology.validateLiteral(newValue.current.value, ractive.get(parent).range);
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


  var loadExistingResource = function (uri) {
    http.get(ractive.get("config.resourceApiUri") + ractive.get("resource_type").toLowerCase() + "/" + uri.substr(uri.lastIndexOf("/") + 1),
      {"Accept": "application/ld+json"})
    .then(function (response) {
      ractive.set("resource_uri", uri);
      var values = ontology.extractValues(JSON.parse(response.responseText));
      for (var n in ractive.get("inputs")) {
        var kp = "inputs." + n;
        var input = ractive.get(kp);
        if (values[input.predicate]) {
          ractive.set(kp + ".values", values[input.predicate]);
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
    http.post(ractive.get("config.resourceApiUri") + ractive.get("resource_type").toLowerCase(),
      {"Accept": "application/ld+json", "Content-Type": "application/ld+json"},
       "{}"
     ).then(function (response) {
      // now that the resource exists - redirect to load the new resource
      window.location.replace(location.href + "?resource=" + response.getResponseHeader("Location"));
    })
    .catch(function (err) {
      console.log("POST to " + ractive.get("resource_type").toLowerCase() + " fails: " + err);
    });
  };

  var loadAuthorizedValues = function (url, predicate) {
    //onAuthorizedValuesLoad(props[i]["@id"]),
    http.get(
      url,
      {"Accept": "application/ld+json"})
    .then(function (res) {
      var values = JSON.parse(res.responseText);
      // resolve all @id uris
      values["@graph"].forEach(function (v) {
        v["@id"] = ontology.resolveURI(values, v["@id"]);
      });

      var values_sorted = values["@graph"].sort(function (a, b) {
        if (a["rdfs:label"]["@value"] < b["rdfs:label"]["@value"]) {
          return -1;
        }
        if (a["rdfs:label"]["@value"] > b["rdfs:label"]["@value"]) {
          return 1;
        }
        return 0;
      });

      ractive.set("authorized_values." + predicate.split(":")[1], values_sorted);
    })
    .catch(function (err) {
      console.log("GET authorized values error: " + err);
    });
  };

  var onOntologyLoad = function (response) {
    var ont = response,
        props = ontology.propsByClass(ont, ractive.get("resource_type")),
        inputs = [];

    ractive.set("ontology", ont);

    ractive.set("resource_label", ontology.resourceLabel(ont, ractive.get("resource_type"), "no").toLowerCase());

    for (var i = 0; i < props.length; i++) {
      var disabled = false;
      if (props[i]["http://data.deichman.no/ui#editable"] !== undefined && props[i]["http://data.deichman.no/ui#editable"] !== true) {
        disabled = true;
      }

      // Fetch authorized values, if required
      if (props[i]["http://data.deichman.no/utility#valuesFrom"]) {
        var url = props[i]["http://data.deichman.no/utility#valuesFrom"]["@id"];
        loadAuthorizedValues(url, props[i]["@id"]);
      }
      var datatype = props[i]["rdfs:range"]["@id"];
      var input = {
        disabled: disabled,
        predicate: ontology.resolveURI(ont, props[i]["@id"]),
        authorized: props[i]["http://data.deichman.no/utility#valuesFrom"] ? true : false,
        range: datatype,
        datatype: datatype,
        label: props[i]["rdfs:label"][0]["@value"],
        values: [{old: { value: "", lang: "" },
                  current: { value: "", lang: "" }}]
      };

      if (input.authorized) {
        switch (input.predicate.substring(input.predicate.lastIndexOf("#") + 1)) {
          case "language":
            input.type = "input-authorized-language";
            break;
          case "format":
            input.type = "input-authorized-format";
            break;
        }
        input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
      } else {
        switch (input.range) {
          case "http://www.w3.org/2001/XMLSchema#string":
            input.type = "input-string";
            break;
          case "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString":
            input.type = "input-lang-string";
            break;
          case "http://www.w3.org/2001/XMLSchema#gYear":
            input.type = "input-gYear";
            break;
          case "http://www.w3.org/2001/XMLSchema#nonNegativeInteger":
            input.type = "input-nonNegativeInteger";
            break;
          case "deichman:Work":
          case "deichman:Person":
            // TODO infer from ontology that this is an URI
            // (because deichman:Work a rdfs:Class)
            input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
            input.type = "input-string"; // temporarily
            break;
          default:
            throw "Doesn't know which input-type to assign to range: " + input.range;
        }
      }
      inputs.push(input);
    }

    ractive.set("inputs", inputs);

    // If resource URI is given in query string, it will be loaded for editing, otherwise we will
    // request a new URI for working on a new resource.
    var uri = getURLParameter("resource");
    if (uri) {
      loadExistingResource(uri);
    } else {
      createNewResource();
    }
  };

  // Find resource type from url path
  ractive.set("resource_type", string.titelize(location.pathname.substr(location.pathname.lastIndexOf("/") + 1)));

  // Application entrypoint - start with fetching config
  http.get("/config", {"Accept": "application/ld+json"})
  .then(function (res) {
    ractive.set("config", JSON.parse(res.responseText));
  })
  .then(function () {
    http.get(ractive.get("config.ontologyUri"), {"Accept": "application/ld+json"})
    .then(function (res) {
      onOntologyLoad(JSON.parse(res.responseText));
    });
  })
  .catch(function (err) {
    console.log("There was an error: " + err);
  });

});
