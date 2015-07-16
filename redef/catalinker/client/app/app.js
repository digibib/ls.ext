 // TODO move this function to libs.js?
 function getURLParameter(name) {
   return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
 };

var errors = [];
var ractive = new Ractive({
   el: "#container",
   lang: "no",
   template: "#template",
   data: {
     errors: errors,
     work_uri: "",
     inputs: {},
     ontology: null,
     save_status: "nytt verk"
   },
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
     var patch = rdf.createPatch(ractive.get("work_uri"), predicate, event.context);
     http.patch(ractive.get("work_uri"),
       {"Accept": "application/ld+json", "Content-Type": "application/ldpatch+json"},
       patch,
       function (response) {
         // successfully patched resource

         // keep the value in current.old - so we can do create delete triple patches later
         var cur = ractive.get(event.keypath + ".current");
         ractive.set(event.keypath + ".old.value", cur.value);
         ractive.set(event.keypath + ".old.lang", cur.lang);
         ractive.set(event.keypath + ".old.datatype", cur.datatypr);

         ractive.set("save_status", "alle endringer er lagret");
       },
       function (response) {
         // failed to patch resource
         errors.push("Noe gikk galt! Fikk ikke lagret endringene")
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
     valid = rdf.validateLiteral(newValue.current.value, ractive.get(parent).range);
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

// Application entrypoint - will fetch any resources (ontology etc) required to populate the UI.
http.get("/config", {"Accept": "application/ld+json"},
   function (response) {
     cfg = JSON.parse(response.responseText);

     // fetch ontology
     http.get(cfg.ontologyUri, {"Accept": "application/ld+json"},
       function (response) {
         var ontology = JSON.parse(response.responseText),
             props = rdf.propsByClass(ontology, "Work"),
             inputs = [];

         ractive.set("ontology", ontology);

         for (var i = 0; i < props.length; i++) {
           inputs.push({
             predicate: rdf.resolveURI(ontology,  props[i]["@id"]),
             range: props[i]["rdfs:range"]["@id"],
             label: props[i]["rdfs:label"][0]["@value"],
             values: [{old: { value: "", type: "", lang: "" },
                       current: { value: "", type: "", lang: "" }}]
           });
         }
         ractive.set("inputs", inputs);
       },
      function (response) {
        console.log("GET ontology error: " + response);
      });

     // If resource URI is given in query string, it will be loaded for editing, otherwise we will
     // request a new URI for working on a new resource.
     var uri = getURLParameter("resource");
     if (uri) {
       // load existing resource
       http.get(cfg.resourceApiUri + "work/" + uri.substr(uri.lastIndexOf("/") + 1),
         {"Accept": "application/ld+json"},
       function (response) {
         ractive.set("work_uri", uri);
         var values = rdf.extractValues(JSON.parse(response.responseText));
         for (var n in ractive.get("inputs")) {
           var kp = "inputs." + n;
           var input = ractive.get(kp);
           if (values[input.predicate]) {
             ractive.set(kp + ".values", values[input.predicate]);
           }
         }

         ractive.set("save_status", "åpnet eksisterende verk");
       },
       function (response) {
         console.log(response);
       });
     } else {
       // fetch URI for work
       http.post(cfg.resourceApiUri + "work",
         {"Accept": "application/ld+json", "Content-Type": "application/ld+json"},
          "{}",
       function (response) {
         work_uri = response.getResponseHeader("Location");
         ractive.set("work_uri", work_uri);
       },
       function (response) {
         console.log("POST work error: " + response);
       });
     }
   },
  function (response) {
    console.log("GET config error: " + response);
  });
