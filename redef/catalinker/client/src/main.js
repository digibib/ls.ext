requirejs(['graph', 'http', 'ontology', 'string'], function (graph, http, ontology, string) {

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
        old: { value: "", type: "", lang: "" },
        current: { value: "", type: "", lang: "" }
      });
    },
    // patchResource creates a patch request based on previous and current value of
    // input field, and sends this to the backend.
    patchResource: function (event, predicate) {
      if (event.context.error || (event.context.current.value === "" && event.context.old.value === "")) {
        return;
      }
      var patch = ontology.createPatch(ractive.get("resource_uri"), predicate, event.context);
      http.patch(ractive.get("resource_uri"),
        {"Accept": "application/ld+json", "Content-Type": "application/ldpatch+json"},
        patch,
        function (response) {
          // successfully patched resource

          // keep the value in current.old - so we can do create delete triple patches later
          var cur = ractive.get(event.keypath + ".current");
          ractive.set(event.keypath + ".old.value", cur.value);
          ractive.set(event.keypath + ".old.lang", cur.lang);
          ractive.set(event.keypath + ".old.datatype", cur.datatype);

          ractive.set("save_status", "alle endringer er lagret");
        },
        function (response) {
          // failed to patch resource

          // TODO provide better error message (when we figure out how to deal with CORS responses)
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


  var loadExisitingResource = function (uri) {
    http.get(ractive.get("config.resourceApiUri") + ractive.get("resource_type").toLowerCase() + "/" + uri.substr(uri.lastIndexOf("/") + 1),
      {"Accept": "application/ld+json"},
    function (response) {
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
    },
    function (response) {
      console.log(response);
    });
  };

  var createNewResource = function () {
    // fetch URI for new resource
    http.post(ractive.get("config.resourceApiUri") + ractive.get("resource_type").toLowerCase(),
      {"Accept": "application/ld+json", "Content-Type": "application/ld+json"},
       "{}",
    function (response) {
      // now that the resource exists - redirect to load the new resource
      window.location.replace(location.href + "?resource=" + response.getResponseHeader("Location"));
    },
    function (response) {
      console.log("POST to " + ractive.get("resource_type").toLowerCase() + " fails: " + response);
    });
  };

  var onOntologyLoad = function (response) {
    var ont = JSON.parse(response.responseText),
        props = ontology.propsByClass(ont, ractive.get("resource_type")),
        inputs = [];

    ractive.set("ontology", ont);

    ractive.set("resource_label", ontology.resourceLabel(ont, ractive.get("resource_type"), "no").toLowerCase());

    for (var i = 0; i < props.length; i++) {
      inputs.push({
        predicate: ontology.resolveURI(ont,  props[i]["@id"]),
        range: props[i]["rdfs:range"]["@id"],
        label: props[i]["rdfs:label"][0]["@value"],
        values: [{old: { value: "", type: "", lang: "" },
                  current: { value: "", type: "", lang: "" }}]
      });
    }
    ractive.set("inputs", inputs);

    // If resource URI is given in query string, it will be loaded for editing, otherwise we will
    // request a new URI for working on a new resource.
    var uri = getURLParameter("resource");
    if (uri) {
      loadExisitingResource(uri);
    } else {
      createNewResource();
    }
  };

  var onOntologyFailure = function (response) {
    console.log("GET ontology error: " + response);
  };

  var onConfigFailure = function (response) {
    console.log("GET config error: " + response);
  };

  var onConfigLoaded = function (response) {
    ractive.set("config", JSON.parse(response.responseText));

    // fetch ontology
    http.get(
      ractive.get("config.ontologyUri"),
      {"Accept": "application/ld+json"},
      onOntologyLoad,
      onOntologyFailure
    );
  };

  // Find resource type from url path
  ractive.set("resource_type", string.titelize(location.pathname.substr(location.pathname.lastIndexOf("/") + 1)));

  // Application entrypoint - start with fetching config
  http.get(
    "/config",
    {"Accept": "application/ld+json"},
    onConfigLoaded,
    onConfigFailure
  );

});
