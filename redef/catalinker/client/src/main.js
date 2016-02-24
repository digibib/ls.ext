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
        var $ = require("jquery");
        var ldGraph = require("ld-graph");
        var URI = require("urijs");
        module.exports = factory(Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI);

    } else {
        // Browser globals (root is window)
        root.Main = factory(root.Ractive, root.axios, root.Graph, root.Ontology, root.StringUtil, root._, root.$, root.ldGraph, root.URI);
    }
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI) {
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

    var unloadResourceForDomain = function (domainType) {
        _.each(ractive.get("inputs"), function (input, inputIndex) {
            if (domainType === unPrefix(input.domain)) {
                var kp = "inputs." + inputIndex;
                ractive.set(kp + '.values.*.current.value', '');
                ractive.set(kp + '.values.*.old.value', '');
            }
        });
        ractive.set("targetUri." + domainType, null);
        updateBrowserLocation(domainType, null);
    };

    function i18nLabelValue(label) {
        if (Array.isArray(label)) {
            var value = _.find(label, function (labelValue) {
                return ("no" === labelValue['@language']);
            })['@value'];
            if (value === undefined) {
                value = labelValue[0]['@value'];
            }
            return value;
        }
        else {
            return label['@value'];
        }
    }

    function propertyName(predicate) {
        return _.last(predicate.split("#"));
    }

    function setMultiValues(values, inputs_n) {
        if (values && values.length > 0) {
            var valuesAsArray = values.length == 0 ? [] : _.map(values, function (value) {
                return value.id;
            });
            ractive.set(inputs_n + ".values.0", {
                old: {
                    value: valuesAsArray
                },
                current: {
                    value: valuesAsArray
                }
            });
//            console.log("setMultiValues: Setting " + inputs_n + ".values.0.current.value -> " + ractive.get(inputs_n + ".values.0.current.value"));
            return valuesAsArray;
        }
    }

    function setSingleValues(values, inputs_n) {
        if (values.length > 0) {
            var idx;
            for (idx = 0; idx < values.length; idx++) {
                ractive.set(inputs_n + ".values." + idx, {
                    old: {
                        value: values[idx].value,
                        lang: values[idx].lang
                    },
                    current: {
                        value: values[idx].value,
                        lang: values[idx].lang
                    }
                });
//                console.log("setSingleValues: Setting " + inputs_n + ".values." + idx + ".current.value -> " + ractive.get(inputs_n + ".values." + idx + ".current.value"));
            }
        }
    }

    function setIdValues(values, inputs_n) {
        if (values.length > 0) {
            var idx;
            for (idx = 0; idx < values.length; idx++) {
                ractive.set(inputs_n + ".values." + idx, {
                    old: {
                        value: values[idx].id
                    },
                    current: {
                        value: values[idx].id
                    }
                });
//                console.log("setIdValues: Setting " + inputs_n + ".values." + idx + ".current.value -> " + ractive.get(inputs_n + ".values." + idx + ".current.value"));
           }
        }
    }

    function updateBrowserLocation(type, resourceUri) {
        var oldUri = URI.parse(document.location.href);
        var queryParameters = URI.parseQuery(oldUri.query);
        var triumphRanking = {"Person": 1, "Work": 2, "Publication": 3};
        var parametersPresentInUrl = _.keys(queryParameters);
        var triumph = _.reduce(parametersPresentInUrl, function (memo, param) {
            return triumphRanking[param] > triumphRanking[memo] ? param : memo;
        }, type);
        if (triumph === type) {
            var queryParams = {};
            if (resourceUri) {
                queryParams[type] = resourceUri;
            }
            oldUri.query = URI.buildQuery(queryParams);
            history.pushState("", "", URI.build(oldUri));
        }
    }

    function loadLabelsForAuthorizedValues(input, values, inputs_n) {
        if (input.nameProperties) {
            _.each(values, function (uri) {
                var name = axios.get(uri).then(function (response) {
                    var graphData = ensureJSON(response.data);
                    var root = ldGraph.parse(graphData).byId(uri);
                    var names = _.reduce(input.nameProperties, function (parts, propertyName) {
                        var all = root.getAll(propertyName);
                        _.each(all, function (value, index) {
                            if (!parts[index]) {
                                parts[index] = [];
                            }
                            parts[index].push(value.value);
                        });
                        return parts;
                    }, []);

                    var selectedValues = [];
                    _.each(names, function (nameParts, index) {
                        var label = nameParts.join(" - ");
                        ractive.set(inputs_n + ".values." + index + ".current.displayName", label);
                        ractive.set("authorityLabels[" + uri + "]", label);
                        $("#" + input.uniqueId).trigger("change");
                    });
                });
            });
            ractive.update();
        }
    }

    var loadExistingResource = function (resourceUri, options) {
        return axios.get(resourceUri)
            .then(function (response) {
                    var graphData = ensureJSON(response.data);

                    var type = StringUtil.titelize(/^.*\/(work|person|publication)\/.*$/g.exec(resourceUri)[1]);
                    var root = ldGraph.parse(graphData).byType(type)[0];

                    _.each(ractive.get("inputs"), function (input, inputIndex) {
                        if (type == unPrefix(input.domain) && !(_.contains(_.values(_.pick(options, "leaveUnchanged")), input.fragment))) {
                            var inputs_n = "inputs." + inputIndex;
                            var predicate = input.predicate;
                            if (input.type === "select-authorized-value" || input.type === "entity" || input.type === "searchable-authority") {
                                var values = setMultiValues(root.outAll(propertyName(predicate)), inputs_n);
                                loadLabelsForAuthorizedValues(input, values, inputs_n);
                            } else if (input.type === "searchable-creator") {
                                setIdValues(root.outAll(propertyName(predicate)), inputs_n);
                            } else if (input.type === "select-predefined-value") {
                                setMultiValues(root.outAll(propertyName(predicate)), inputs_n);
                            } else {
                                setSingleValues(root.getAll(propertyName(predicate)), inputs_n);
                            }
                        }
                    });
                    ractive.update();
                    ractive.set("save_status", "åpnet eksisterende ressurs");
                    ractive.set("targetUri." + type, resourceUri);
                    updateBrowserLocation(type, resourceUri);
                }
            )
            .catch(function (err) {
                console.log("HTTP GET existing resource failed with:");
                console.log(err);
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
                ractive.set("targetUri." + resourceType, resourceUri);
                _.each(inputsToSave, function (input) {
                    _.each(input.values, function (value) {
                        Main.patchResourceFromValue(resourceUri, input.predicate, value, input.datatype, errors);
                    })
                });
                ractive.update();
            })
            .then(function () {
                loadExistingResource(ractive.get("targetUri." + resourceType));
            })
            .catch(function (err) {
                console.log("POST to " + resourceType.toLowerCase() + " fails: " + err);
                errors.push(err);
                ractive.set("errors", errors);
            });
    };

    var loadPredefinedValues = function (url, property) {
        return axios.get(url)
            .then(function (response) {
                var values = ensureJSON(response.data);
                // resolve all @id uris
                values["@graph"].forEach(function (v) {
                    v["@id"] = Ontology.resolveURI(values, v["@id"]);
                });

                var valuesSorted = values["@graph"].sort(function (a, b) {
                    if (a["rdfs:label"]["@value"] < b["rdfs:label"]["@value"]) {
                        return -1;
                    }
                    if (a["rdfs:label"]["@value"] > b["rdfs:label"]["@value"]) {
                        return 1;
                    }
                    return 0;
                });
                return {property: property, values: valuesSorted};
            }).catch(function (error) {
                console.log(error);
            });
    };

    var createInputGroups = function (applicationData) {
        var props = Ontology.allProps(applicationData.ontology),
            inputs = [],
            inputMap = {};
        applicationData.predefinedValues = {};
        var predefinedValues = [];
        for (var i = 0; i < props.length; i++) {
            var disabled = false;
            if (props[i]["http://data.deichman.no/ui#editable"] !== undefined && props[i]["http://data.deichman.no/ui#editable"] !== true) {
                disabled = true;
            }

            // Fetch authorized values, if required
            var predicate = Ontology.resolveURI(applicationData.ontology, props[i]["@id"]);
            if (props[i]["http://data.deichman.no/utility#valuesFrom"]) {
                var url = props[i]["http://data.deichman.no/utility#valuesFrom"]["@id"];
                predefinedValues.push(loadPredefinedValues(url, props[i]["@id"]))
            }
            var datatype = props[i]["rdfs:range"]["@id"];
            var domains = props[i]["rdfs:domain"];
            _.each(domains, function (domain) {
                if (_.isObject(domain)) {
                    domain = domain['@id'];
                }
                var predefined = props[i]["http://data.deichman.no/utility#valuesFrom"] ? true : false;
                var fragment = predicate.substring(predicate.lastIndexOf("#") + 1);
                var input = {
                    disabled: disabled,
                    searchable: props[i]["http://data.deichman.no/ui#searchable"] ? true : false,
                    predicate: predicate,
                    fragment: fragment,
                    predefined: predefined,
                    range: datatype,
                    datatype: datatype,
                    label: i18nLabelValue(props[i]["rdfs:label"]),
                    domain: domain,
                    values: [{
                        old: {value: "", lang: ""},
                        current: {value: predefined ? [] : "", lang: ""}
                    }],
                    dataAutomationId: unPrefix(domain) + "_" + predicate + "_0",
                    uniqueId: _.uniqueId()
                };

                if (input.searchable) {
                    input.type = "searchable-creator";
                    input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
                } else if (input.predefined) {
                    input.type = "select-predefined-value";
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
                        case "deichman:PlaceOfPublication":
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
        var ontologyUri = applicationData.config.ontologyUri;
        var tabs = applicationData.config.tabs;
        _.each(tabs, function (tab) {
            var group = {};
            var groupInputs = [];
            _.each(tab.inputs, function (prop) {
                var currentInput = inputMap[tab.rdfType + "." + ontologyUri + "#" + prop.rdfProperty];
                if (typeof currentInput === 'undefined') {
                    throw "Tab '" + tab.label + "' specified unknown property '" + prop.rdfProperty + "'";
                }
                if (tab.rdfType === unPrefix(currentInput.domain)) {
                    groupInputs.push(currentInput);
                    currentInput.rdfType = tab.rdfType;
                }
                if (prop.multiple) {
                    currentInput.multiple = true;
                }
                if (prop.authority) {
                    currentInput.type = 'searchable-authority'
                }
                if (prop.indexType) {
                    currentInput.indexType = prop.indexType
                }
                if (prop.indexDocumentFields) {
                    currentInput.indexDocumentFields = prop.indexDocumentFields
                }
                if (prop.type) {
                    currentInput.type = prop.type;
                }
                currentInput.visible = prop.type !== 'entity'
                if (prop.nameProperties) {
                    currentInput.nameProperties = prop.nameProperties;
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
        applicationData.inputGroups = inputGroups;
        applicationData.inputs = inputs;
        return axios.all(predefinedValues).then(function (values) {
            _.each(values, function (predefinedValue) {
                applicationData.predefinedValues[unPrefix(predefinedValue.property)] = predefinedValue.values;
            });
            return applicationData;
        });
    };

    function grandParentOf(keypath) {
        return _.initial(_.initial(keypath.split("."))).join(".");
    }

    /* public API */
    var Main = {
        getURLParameter: function (name) {
            // http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(location.search);
            return results === null ? null : results[1];
        },
        patchResourceFromValue: function (subject, predicate, oldAndcurrentValue, datatype, errors, keypath) {
            var patch = Ontology.createPatch(subject, predicate, oldAndcurrentValue, datatype);
            if (patch && patch.trim() != "" && patch.trim() != "[]") {
                ractive.set("save_status", "arbeider...");
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

                        }
                        ractive.set("save_status", "alle endringer er lagret");
                        ractive.update();
                    })
                    .catch(function (response) {
                        // failed to patch resource
                        console.log("HTTP PATCH failed with: ");
                        errors.push("Noe gikk galt! Fikk ikke lagret endringene");
                        ractive.set("save_status", "");
                    });
            }
        },
        init: function () {
            var template = "/main_template.html";
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
            var loadTemplate = function (applicationData) {
                return axios.get(template).then(
                    function (response) {
                        applicationData.template = response.data;
                        return applicationData;
                    });
            };

            var extractConfig = function (response) {
                return {config: ensureJSON(response.data)};
            };

            var initRactive = function (applicationData) {
                Ractive.decorators.select2.type.singleSelect = function (node) {
                    return {
                        maximumSelectionLength: 1
                    }
                };

                Ractive.decorators.select2.type.authoritySelectSingle = function (node) {
                    var inputDef = ractive.get(grandParentOf(Ractive.getNodeInfo(node).keypath));
                    var indexType = inputDef.indexType;
                    return {
                        maximumSelectionLength: 1,
                        minimumInputLength: 3,
                        ajax: {
                            url: ractive.get("config.resourceApiUri") + "search/" + indexType + "/_search",
                            dataType: 'json',
                            delay: 250,
                            id: function (item) {
                                return item._source.person.uri;
                            },
                            data: function (params) {
                                return {
                                    q: params.term, // search term
                                    page: params.page
                                };
                            },
                            processResults: function (data, params) {
                                params.page = params.page || 1;

                                var select2Data = $.map(data.hits.hits, function (obj) {
                                    obj.id = obj._source[indexType].uri;
                                    obj.text = _.map(inputDef.indexDocumentFields, function (field) {
                                        return obj._source[indexType][field];
                                    }).join(' - ');
                                    return obj;
                                });

                                return {
                                    results: select2Data,
                                    pagination: {
                                        more: (params.page * 30) < data.total_count
                                    }
                                };
                            },
                            cache: true
                        },
                        templateSelection: function (data) {
                            return data.text === "" ? ractive.get("authorityLabels[" + data.id + "]") : data.text;
                        }
                    }
                };

                // Initialize ractive component from template
                ractive = new Ractive({
                    el: "container",
                    lang: "no",
                    template: applicationData.template,
                    data: {
                        predefinedValues: applicationData.predefinedValues,
                        errors: errors,
                        resource_type: "",
                        resource_label: "",
                        ontology: null,
                        search_result: null,
                        config: applicationData.config,
                        save_status: "ny ressurs",
                        isSelected: function (option, value) {
                            return option["@id"].contains(value) ? "selected='selected'" : "";
                        },
                        getRdfsLabelValue: function (label) {
                            return i18nLabelValue(label)
                        },
                        tabEnabled: function (tabSelected, domainType) {
                            return tabSelected === true || (typeof ractive.get("targetUri." + domainType) === "string");
                        },
                        nextStepEnabled: function (domainType) {
                            return !(domainType === 'Work' && !ractive.get('targetUri.Person'));
                        },
                        publicationId: function () {
                            var publicationIdInput = _.find(ractive.get("inputs"), function (input) {
                                return input.predicate.indexOf("#recordID") != -1;
                            });
                            if (publicationIdInput) {
                                return _.first(publicationIdInput.values).current.value;
                            }
                        },
                        inPreferredLanguage: function (text) {
                            if (typeof text === 'string') {
                                return text;
                            } else {
                                var preferredTexts = _.compact([
                                    _.find(text, function (value, lang) {
                                        return lang === "nb";
                                    }), _.find(text, function (value, lang) {
                                        return lang === "nn";
                                    }), _.find(text, function (value, lang) {
                                        return lang === "default";
                                    }), _.find(text, function () {
                                        return true;
                                    })]);
                                return _.first(preferredTexts);
                            }
                        },
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
                        multi: require('ractive-multi-decorator'),
                        repositionSupportPanel: function (node) {
                            //$(node).find(".support-panel").css({top: $(node).position().top})
                            Main.repositionSupportPanelsHorizontally();
                            return {
                                teardown: function () {
                                }
                            }
                        },
                        detectChange: function (node) {
                            var enableChange = false;
                            $(node).on("select2:selecting select2:unselecting", function () {
                                enableChange = true;
                            });
                            $(node).on("change", function (e) {
                                if (enableChange) {
                                    enableChange = false;
                                    var inputValue = Ractive.getNodeInfo(e.target);
                                    var keypath = inputValue.keypath;
                                    ractive.set(keypath + ".current.value", $(e.target).val());
                                    var inputNode = ractive.get(grandParentOf(keypath));
                                    Main.patchResourceFromValue(ractive.get("targetUri." + inputNode.rdfType), inputNode.predicate,
                                        ractive.get(keypath), inputNode.datatype, errors, keypath)
                                }
                            });
                            return {
                                teardown: function () {
                                }
                            }
                        }
                    }
                });
                ractive.on({
                    // addValue adds another input field for the predicate.
                    addValue: function (event) {
                        ractive.get(event.keypath).values.push({
                            old: {value: "", lang: ""},
                            current: {value: "", lang: ""}
                        });
                    },
                    // patchResource creates a patch request based on previous and current value of
                    // input field, and sends this to the backend.
                    patchResource: function (event, predicate, rdfType) {
                        var inputValue = event.context;
                        if (inputValue.error || (inputValue.current.value === "" && inputValue.old.value === "")) {
                            return;
                        }
                        var datatype = event.keypath.substr(0, event.keypath.indexOf("values")) + "datatype";
                        var subject = ractive.get("targetUri." + rdfType);
                        if (subject) {
                            Main.patchResourceFromValue(subject, predicate, inputValue, ractive.get(datatype), errors, event.keypath);
                            ractive.update();
                        }
                    },
                    searchResource: function (event, predicate, searchString) {
                        // TODO: searchType should be deferred from predicate, fetched from ontology by rdfs:range
                        var searchType = "person";
                        var searchURI = ractive.get("config.resourceApiUri") + "search/" + searchType + "/_search";
                        var searchData = {
                            query: {
                                match: {
                                    'person.name': {
                                        query: searchString,
                                        operator: "and"
                                    }
                                }
                            }
                        };
                        axios.post(searchURI, searchData)
                            .then(function (response) {
                                var results = ensureJSON(response.data);
                                results.hits.hits.forEach(function (hit) {
                                    var person = hit._source.person;
                                    person.isChecked = false;
                                    _.each(person.work, function (work) {
                                        work.isChecked = false;
                                    });
                                });

                                ractive.set("search_result", {
                                    origin: event.keypath,
                                    predicate: predicate,
                                    results: results
                                });
                            }).catch(function (err) {
                            console.log(err);
                        });
                    },
                    toggleWork: function (event) {
                        var keypath = event.keypath + '.toggleWork';
                        ractive.get(keypath) !== true ?
                            ractive.set(keypath, true) :
                            ractive.set(keypath, false);
                    },
                    selectPersonResource: function (event, predicate, origin) {
                        unloadResourceForDomain("Work");
                        unloadResourceForDomain("Publication");
                        var uri = event.context.uri;
                        var name = event.context.name;
                        loadExistingResource(uri);
                        ractive.set(origin + ".old.value", ractive.get(origin + ".current.value"));
                        ractive.set(origin + ".current.value", uri);
                        ractive.set(origin + ".current.displayValue", name);
                        ractive.set(origin + ".deletable", true);
                        ractive.set(origin + ".searchable", false);
                    },
                    selectWorkResource: function (event) {
                        var uri = event.context.uri;
                        unloadResourceForDomain("Publication");
                        loadExistingResource(uri, {leaveUnchanged: "creator"});
                    },
                    setResourceAndWorkResource: function (event, person, predicate, origin, domainType) {
                        ractive.fire("selectPersonResource", {context: person}, predicate, origin, domainType);
                        ractive.fire("selectWorkResource", {context: event.context});
                    },
                    delResource: function (event, predicate) {
                        ractive.set("search_result", null);
                        ractive.set(event.keypath + ".current.value", "");
                        ractive.set(event.keypath + ".current.displayValue", "");
                        ractive.set(event.keypath + ".deletable", false);
                        ractive.set(event.keypath + ".searchable", true);
                        ractive.fire("patchResource", {keypath: event.keypath, context: event.context}, predicate);
                    },
                    unselectWorkAndPerson: function (event) {
                        ractive.set("search_result", null);
                        ractive.set(event.keypath + ".current.value", "");
                        ractive.set(event.keypath + ".current.displayValue", "");
                        ractive.set(event.keypath + ".deletable", false);
                        ractive.set(event.keypath + ".searchable", true);
                        unloadResourceForDomain('Work');
                        unloadResourceForDomain('Person');
                    },
                    activateTab: function (event) {
                        _.each(ractive.get("inputGroups"), function (group, groupIndex) {
                            var keyPath = "inputGroups." + groupIndex;
                            ractive.set(keyPath + ".tabSelected", keyPath === event.keypath);
                        });
                    },
                    nextStep: function (event) {
                        if (event.context.restart) {
                            var url = URI.parse(document.location.href);
                            url.query = {};
                            window.location.replace(URI.build(url));
                        }
                        var newResourceType = event.context.createNewResource;
                        if (newResourceType && (!ractive.get("targetUri." + newResourceType))) {
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
                ractive.observe("inputGroups.*.inputs.*.values.*", function (newValue, oldValue, keypath) {
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

                ractive.observe("search_result.results.hits.hits.*._source.person.isChecked", function (newValue, oldValue, keypath) {
                    if (newValue === true) {
                        var workPath = getParentFromKeypath(keypath);
                        checkSelectedSearchResults([workPath]);
                    }
                });

                ractive.observe("search_result.results.hits.hits.*._source.person.work.*.isChecked", function (newValue, oldValue, keypath) {
                    if (newValue === true) {
                        var workPath = getParentFromKeypath(keypath);
                        var personPath = getParentFromKeypath(keypath, 3);
                        checkSelectedSearchResults([personPath, workPath]);
                    }
                });

                ractive.observe("targetUri.Work", function (newValue, oldValue, keypath) {
                    _.each(ractive.get("inputs"), function (input, inputIndex) {
                        if (input.predicate.indexOf("#publicationOf") != -1) {
                            ractive.set("inputs." + inputIndex + ".values.0.current.value", newValue);
                            ractive.set("inputs." + inputIndex + ".values.0.old.value", "");
                        }
                    });
                });

                ractive.observe("targetUri.Person", function (newValue, oldValue, keypath) {
                    if (newValue) {
                        var inputs = ractive.get("inputs");
                        var creatorInputOfWork = _.find(inputs, function (input) {
                            return (input.predicate.indexOf("#creator") != -1);
                        });
                        var creatorNameInput = _.find(inputs, function (input) {
                            return (unPrefix(input.domain) === "Person" && input.fragment === "name");
                        });

                        creatorInputOfWork.values[0].current.displayValue = creatorNameInput.values[0].current.value;
                        creatorInputOfWork.values[0].deletable = true;
                        ractive.update();
                    }
                });

                function getParentFromKeypath(keypath, parentLevels) {
                    parentLevels = parentLevels || 1;
                    var split = keypath.split('.');
                    return split.splice(0, split.length - parentLevels).join('.');
                }

                function checkSelectedSearchResults(pathsToCheck) {
                    ractive.set("search_result.results.hits.hits.*._source.person.isChecked", false);
                    ractive.set("search_result.results.hits.hits.*._source.person.work.*.isChecked", false);
                    pathsToCheck.forEach(function (path) {
                        ractive.set(path + '.isChecked', true);
                    });
                }

                ractive.set("inputGroups", applicationData.inputGroups);
                ractive.set("inputs", applicationData.inputs);
                ractive.set("predefinedValues", applicationData.predefinedValues);
                ractive.update();
                return applicationData;
            };

            var loadOntology = function (applicationData) {
                return axios.get(applicationData.config.ontologyUri)
                    .then(function (response) {
                        applicationData.ontology = ensureJSON(response.data);
                        return applicationData;
                    });
            };

            function initSelect2(applicationData) {
                var select2 = require('select2');
                $.fn.select2.defaults.set("language", {
                    inputTooLong: function (args) {
                        var overChars = args.input.length - args.maximum;

                        return 'Vennligst fjern ' + overChars + ' tegn';
                    },
                    inputTooShort: function (args) {
                        var remainingChars = args.minimum - args.input.length;
                        var message = 'Vennligst skriv inn ';
                        if (remainingChars > 1) {
                            message += ' flere tegn';
                        } else {
                            message += ' tegn til';
                        }
                        return message;
                    },
                    loadingMore: function () {
                        return 'Laster flere resultater…';
                    },
                    maximumSelected: function (args) {
                        if (args.maximum == 1) {
                            return "Du kan bare velge én verdi her";
                        } else {
                            return 'Du kan velge maks ' + args.maximum + ' verdier her';
                        }
                    },
                    noResults: function () {
                        return 'Ingen treff';
                    },
                    searching: function () {
                        return 'Søker…';
                    }
                });
                require('ractive-decorators-select2');
                return applicationData;
            }

            function loadCreatorOfWork() {
                var creatorUri = _.find(ractive.get("inputs"), function (input) {
                    return (input.fragment === "creator");
                }).values[0].current.value;
                return loadExistingResource(creatorUri).then(function () {
                    ractive.set("targetUri.Person", creatorUri);
                });
            }

            function loadWorkOfPublication() {
                var workUri = _.find(ractive.get("inputs"), function (input) {
                    return (input.fragment === "publicationOf");
                }).values[0].current.value[0];
                return loadExistingResource(workUri).then(function () {
                    ractive.set("targetUri.Work", workUri);
                });
            }

            var loadResourceOfQuery = function (applicationData) {
                var query = URI.parseQuery(URI.parse(document.location.href).query);
                if (query.Publication) {
                    loadExistingResource(query.Publication)
                        .then(loadWorkOfPublication)
                        .then(loadCreatorOfWork)
                        .then(function () {
                            ractive.set("targetUri.Publication", query.Publication);
                            ractive.fire("activateTab", {keypath: "inputGroups.3"});
                        });
                } else if (query.Work) {
                    loadExistingResource(query.Work)
                        .then(loadCreatorOfWork)
                        .then(function () {
                            ractive.set("targetUri.Work", query.Work);
                            ractive.fire("activateTab", {keypath: "inputGroups.2"});
                        });
                } else if (query.Person) {
                    loadExistingResource(query.Person).then(function () {
                        ractive.set("targetUri.Person", query.Person);
                        ractive.fire("activateTab", {keypath: "inputGroups.0"});
                    });
                }
                return applicationData;
            };

            return axios.get("/config")
                .then(extractConfig)
                .then(loadTemplate)
                .then(loadOntology)
                .then(createInputGroups)
                .then(initSelect2)
                .then(initRactive)
                .then(loadResourceOfQuery)
                .catch(function (err) {
                    console.log("Error initiating Main: " + err);
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

