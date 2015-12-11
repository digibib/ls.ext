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
        var $ = require("jquery")
        var ldGraph = require("ld-graph");

        module.exports = factory(Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph);

    } else {
        // Browser globals (root is window)
        root.Main = factory(root.Ractive, root.axios, root.Graph, root.Ontology, root.StringUtil, root._, root.$, root.ldGraph);
    }
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph) {
    "use strict";

    Ractive.DEBUG = false;
    var ractive;

    // need to leave already parsed JSON from axios
    var ensureJSON = function (res) {
        return (typeof res === "string") ? JSON.parse(res) : res;
    };

    /* Private functions */
    function unPrefix(prefixed) {
        return _.last(prefixed.split(":"));
    }

    var loadExistingResource = function (uri) {
        axios.get(uri)
            .then(function (response) {
                ractive.set("resource_uri", uri);
                var resource;
                var graphData = ensureJSON(response.data);

                var type = StringUtil.titelize(/^.*\/(work|person|publication)\/.*$/g.exec(uri)[1]);
                var root = ldGraph.parse(graphData).byType(type)[0];

                _.each(_.filter(ractive.get("inputs"),
                    function (input) {
                        return type == unPrefix(input.domain);
                    }),
                    function (input, inputIndex) {
                        var kp = "inputs." + inputIndex;
                        var values = root.getAll(_.last(input.predicate.split("#")));
                        if (values.length > 0) {
                            var idx;
                            for (idx = 0; idx < values.length; idx++) {
                                ractive.set(kp + ".values." + idx + ".old", {value: "", lang: ""});
                                ractive.set(kp + ".values." + idx + ".current", {
                                    value: values[idx].value,
                                    lang: values[idx].value
                                });
                                console.log("Setting " + kp + ".values." + idx + ".current.value -> " + ractive.get(kp + ".values." + idx + ".current.value"));
                            }
                        }
                    });
                ractive.update();
                ractive.set("save_status", "åpnet eksisterende ressurs");
            })
            .catch(function (err) {
                console.log("HTTP GET existing resource failed with:");
                console.log(err);
            });
    };

    var createNewResource = function () {
        // fetch URI for new resource
        axios.post(ractive.get("config.resourceApiUri") + ractive.get("resource_type").toLowerCase(),
            {}, {headers: {Accept: "application/ld+json", "Content-Type": "application/ld+json"}})
            .then(function (response) {
                // now that the resource exists - redirect to load the new resource
                window.location.replace(location.href + "?resource=" + response.headers.location);
            })
            .catch(function (err) {
                console.log("POST to " + ractive.get("resource_type").toLowerCase() + " fails: " + err);
            });
    };

    var saveNewResourceFromInputs = function (resourceType) {
        // collect inputs related to resource type
        var inputsToSave = _.filter(ractive.get("inputs"), function (input) {
            return unPrefix(input.domain) === resourceType;
        });
        // force all inputs to appear as changed
        _.each(inputsToSave, function (input) {
            _.each(input.values, function (value) {
                value.old = {
                    value: "",
                    lang: ""
                };
            });
        });
        var errors = [];
        axios.post(ractive.get("config.resourceApiUri") + resourceType.toLowerCase(),
            {}, {headers: {Accept: "application/ld+json", "Content-Type": "application/ld+json"}})
            .then(function (response) {
                var resourceUri = response.headers.location;
                ractive.set("selectedResources[" + resourceType + "]", resourceUri);
                _.each(inputsToSave, function (input) {
                    _.each(input.values, function (value) {
                        Main.patchResourceFromValue(resourceUri, input.predicate, value, input.datatype, errors); // skip keypath for now
                    })
                });
            })
            .catch(function (err) {
                console.log("POST to " + resourceType.toLowerCase() + " fails: " + err);
            });
        ractive.set("errors", errors);

    };

    var loadAuthorizedValues = function (url, predicate) {

        axios.get(url)
            .then(function (response) {
                var values = ensureJSON(response.data);
                // resolve all @id uris
                values["@graph"].forEach(function (v) {
                    v["@id"] = Ontology.resolveURI(values, v["@id"]);
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
                ractive.set("authorized_values." + unPrefix(predicate), values_sorted);
            })
            .catch(function (err) {
                console.log("GET authorized values error: " + err);
            });
    };

    var onOntologyLoad = function (ont) {

        var resourceType = ractive.get("resource_type");
        var props = resourceType != "Workflow" ? Ontology.propsByClass(ont, resourceType) : Ontology.allProps(ont),
            inputs = [],
            inputMap = {},
            selectedResources = {};

        ractive.set("ontology", ont);
        ractive.set("resource_label", Ontology.resourceLabel(ont, resourceType, "no").toLowerCase());
        ractive.set("selectedResources", selectedResources);

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
            var domains = props[i]["rdfs:domain"]
            _.each(domains, function (domain) {
                if (_.isObject(domain)) {
                    domain = domain['@id'];
                }
                var input = {
                    disabled: disabled,
                    searchable: props[i]["http://data.deichman.no/ui#searchable"] ? true : false,
                    predicate: Ontology.resolveURI(ont, props[i]["@id"]),
                    authorized: props[i]["http://data.deichman.no/utility#valuesFrom"] ? true : false,
                    range: datatype,
                    datatype: datatype,
                    label: props[i]["rdfs:label"][0]["@value"],
                    domain: domain,
                    values: [{
                        old: {value: "", lang: ""},
                        current: {value: "", lang: ""}
                    }]
                };

                if (input.searchable) {
                    input.type = "input-string-searchable";
                    input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
                } else if (input.authorized) {
                    switch (input.predicate.substring(input.predicate.lastIndexOf("#") + 1)) {
                        case "language":
                            input.type = "select-authorized-language";
                            break;
                        case "format":
                            input.type = "select-authorized-format";
                            break;
                        case "nationality":
                            input.type = "select-authorized-nationality";
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
                inputMap[unPrefix(domain) + "." + input.predicate] = input;
            });


        }
        var inputGroups = [];
        var ontologyUri = ractive.get("config.ontologyUri");
        var tabs = (resourceType === "Workflow") ? ractive.get("config.tabs") : [];
        _.each(tabs, function (tab) {
            var group = {};
            var groupInputs = [];
            _.each(tab.rdfProperties, function (prop) {
                var currentInput = inputMap[tab.rdfType + "." + ontologyUri + "#" + prop];
                if (typeof currentInput === 'undefined') {
                    throw "Tab '" + tab.label + "' specified unknown property '" + prop + "'";
                }
                if (tab.rdfType === unPrefix(currentInput.domain)) {
                    groupInputs.push(currentInput);
                    currentInput.rdfType = tab.rdfType;
                }
            });
            group.inputs = groupInputs;
            group.tabLabel = tab.label;
            group.tabId = tab.id;
            group.tabSelected = false;
            if (tab.nextStep) {
                group.nextStep = tab.nextStep;
            }

            group.domain = tab.rdfType;
            inputGroups.push(group);
        });
        if (inputGroups.length > 0) {
            inputGroups[0].tabSelected = true;
        }
        ractive.set("inputs", inputs);
        ractive.set("inputGroups", inputGroups);

        if (resourceType != "Workflow") {
            // If resource URI is given in query string, it will be loaded for editing, otherwise we will
            // request a new URI for working on a new resource.
            var uri = Main.getURLParameter("resource");
            if (uri) {
                loadExistingResource(uri);
            } else {
                createNewResource();
            }
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
            return results === null ? null : results[1];
        },
        patchResourceFromValue: function (subject, predicate, inputValue, datatype, errors, keypath) {
            var patch = Ontology.createPatch(subject, predicate, inputValue, datatype);
            if (patch && patch.trim() != "") {
                axios.patch(subject, patch, {
                        headers: {
                            Accept: "application/ld+json",
                            "Content-Type": "application/ldpatch+json"
                        }
                    })
                    .then(function (response) {
                        // successfully patched resource

                        // keep the value in current.old - so we can do create delete triple patches later
                        if (keypath) {
                            var cur = ractive.get(keypath + ".current");
                            ractive.set(keypath + ".old.value", cur.value);
                            ractive.set(keypath + ".old.lang", cur.lang);

                            ractive.set("save_status", "alle endringer er lagret");
                        }
                    })
                    .catch(function (response) {
                        // failed to patch resource
                        console.log("HTTP PATCH failed with: ");
                        errors.push("Noe gikk galt! Fikk ikke lagret endringene");
                    });
            }
        },
        init: function (template) {
            template = template || "/main_template.html";
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
                    return axios.get(template);
                })
                .then(function (response) {
                    // Initialize ractive component from template
                    ractive = new Ractive({
                        el: "#container",
                        lang: "no",
                        template: response.data,
                        data: {
                            authorized_values: {},
                            errors: errors,
                            resource_type: "",
                            resource_label: "",
                            resource_uri: "",
                            inputs: {},
                            inputMap: {},
                            ontology: null,
                            search_result: null,
                            config: config,
                            save_status: "ny ressurs",
                            targetResources: {
                                Work: {
                                    uri: "",
                                    pendingProperties: []
                                },
                                Person: {
                                    uri: "",
                                    pendingProperties: []
                                },
                                Publication: {
                                    uri: "",
                                    pendingProperties: []
                                }
                            }
                        },
                        decorators: {
                            repositionSupportPanel: function (node) {
                                $(node).find(".support-panel").css({top: $(node).position().top})
                                Main.repositionSupportPanelsHorizontally();
                                return {
                                    teardown: function () {
                                    }
                                }
                            }
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
                                old: {value: "", lang: ""},
                                current: {value: "", lang: ""}
                            });
                        },
                        // patchResource creates a patch request based on previous and current value of
                        // input field, and sends this to the backend.
                        patchResource: function (event, predicate, origin, rdfType) {
                            var inputValue = event.context;
                            if (inputValue.error || (inputValue.current.value === "" && inputValue.old.value === "")) {
                                return;
                            }
                            var datatype = event.keypath.substr(0, event.keypath.indexOf("values")) + "datatype";
                            var subject = ractive.get("selectedResources[" + rdfType + "]") || ractive.get("resource_uri");
                            if (subject) {
                                Main.patchResourceFromValue(subject, predicate, inputValue, ractive.get(datatype), errors, event.keypath);
                            }
                        },
                        searchResource: function (event, predicate, searchString) {
                            // TODO: searchType should be deferred from predicate, fetched from ontology by rdfs:range
                            var searchType = "person";
                            var searchURI = ractive.get("config.resourceApiUri") + "search/" + searchType + "/_search/?q=" + searchString;
                            axios.get(searchURI)
                                .then(function (response) {
                                    var results = ensureJSON(response.data);
                                    ractive.set("search_result", {
                                        origin: event.keypath,
                                        predicate: predicate,
                                        results: results
                                    });
                                }).catch(function (err) {
                                console.log(err);
                            });
                        },
                        toggleWork: function (event, person) {
                            if (person.toggleWork) {
                                person.toggleWork = false;
                            }
                            else {
                                person.toggleWork = true;
                            }
                            ractive.update();
                        },
                        selectResource: function (event, predicate, origin, domainType) {
                            console.log(event);
                            console.log(predicate);
                            console.log(origin)
                            console.log("domainType: " + domainType);

                            console.log("select resource");
                            // selectResource takes origin as param, as we don't know where clicked search hits comes from
                            var uri = event.context.uri;
                            var name = event.context.name;
                            ractive.set(origin + ".old.value", ractive.get(origin + ".current.value"));
                            ractive.set(origin + ".current.value", uri);
                            ractive.set(origin + ".current.displayValue", name);
                            ractive.set(origin + ".deletable", true);
                            ractive.set(origin + ".searchable", false);
                            loadExistingResource(uri);
                            ractive.set("selectedResources[" + domainType + "]", uri);
                            ractive.update();
                        },
                        selectWorkResource: function (event) {
                            console.log("select work resource");
                            var uri = event.context.uri;
                            loadExistingResource(uri);
                            ractive.set("selectedResources[Work]", uri);
                            ractive.update();
                        },
                        setResourceAndWorkResource: function (event, person, predicate, origin, domainType) {
                            ractive.fire("selectWorkResource", {context: event.context});
                            ractive.fire("selectResource", {context: person}, predicate, origin, domainType);
                        },
                        delResource: function (event, predicate) {
                            ractive.set("search_result", null);
                            ractive.set(event.keypath + ".current.value", "");
                            ractive.set(event.keypath + ".current.displayValue", "");
                            ractive.set(event.keypath + ".deletable", false);
                            ractive.set(event.keypath + ".searchable", true);
                            ractive.update();
                            ractive.fire("patchResource", {keypath: event.keypath, context: event.context}, predicate);
                        },
                        activateTab: function (event) {
                            _.each(ractive.get("inputGroups"), function (group, groupIndex) {
                                var keyPath = "inputGroups." + groupIndex;
                                ractive.set(keyPath + ".tabSelected", keyPath === event.keypath);
                            });
                        },
                        nextStep: function (event) {
                            var newResourceType = event.context.createNewResource;
                            if (newResourceType && (typeof ractive.get("selectedResources[" + newResourceType + "]") === 'undefined')) {
                                saveNewResourceFromInputs(newResourceType);
                            }
                            var foundSelectedTab = false;
                            _.each(ractive.get("inputGroups"), function (group, groupIndex) {
                                var keyPath = "inputGroups." + groupIndex;
                                if (foundSelectedTab) {
                                    ractive.set(keyPath + ".tabSelected", true);
                                    foundSelectedTab = false;
                                } else {
                                    if (ractive.get(keyPath + ".tabSelected")) {
                                        foundSelectedTab = true;
                                    }
                                    ractive.set(keyPath + ".tabSelected", false);
                                }
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
                    debugger;
                    console.log("Error initiating ractive template: " + err);
                });
        },
        loadOntology: function () {
            return axios.get(ractive.get("config.ontologyUri"))
                .then(function (response) {
                    return onOntologyLoad(ensureJSON(response.data));
                }).catch(function (err) {
                    console.log("Error loading ontology: " + err);
                });
        },
        repositionSupportPanelsHorizontally: function () {
            var supportPanelLeftEdge = $("#right-dummy-panel").position().left;
            var supportPanelWidth = $("#right-dummy-panel").width();

            //var existingTop = $(".support-panel").position().top;
            $(".support-panel").each(function (index, panel) {
                var existingTop = $(panel).position().top;
                $(panel).css({left: supportPanelLeftEdge, width: supportPanelWidth});
            });
        },
        getRactive: function () {
            return ractive;
        }
    };

    return Main;
}));
