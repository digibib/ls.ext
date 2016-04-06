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

        var proxyToServices = function (url) {
            var r = new RegExp('http://[^/]+/');
            return url.replace(url.match(r), '/services/');
        };

        /* Private functions */
        function unPrefix(prefixed) {
            return _.last(prefixed.split(":"));
        }

        function clearSearchResults() {
            _.each(ractive.get("inputGroups"), function (group, groupIndex) {
                _.each(group.inputs, function (input, inputIndex) {
                    if (input.search_result) {
                        ractive.set("inputGroups." + groupIndex + ".inputs." + inputIndex + ".search_result", null);
                    }
                });
            });
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

        function setMultiValues(values, input, index) {
            if (values && values.length > 0) {
                var valuesAsArray = values.length == 0 ? [] : _.map(values, function (value) {
                    return value.id;
                });
                if (input.values.length < index + 1) {
                    input.values[input.values.length] = {};
                }
                input.values[index].old = {
                    value: valuesAsArray
                };
                input.values[index].current = {
                    value: valuesAsArray,
                    uniqueId: _.uniqueId()
                };
                input.values[index].uniqueId = _.uniqueId();
                input.values[index].valueIndex = index;
                return valuesAsArray;
            }
        }

        function setSingleValues(values, input) {
            if (values.length > 0) {
                var idx;
                for (idx = 0; idx < values.length; idx++) {
                    input.values[idx].old = {
                        value: values[idx].value,
                        lang: values[idx].lang
                    };
                    input.values[idx].current = {
                        value: values[idx].value,
                        lang: values[idx].lang,
                    };
                    input.values[idx].uniqueId = _.uniqueId();
                }
            }
        }

        function setSingleValue(value, input, index) {
            if (value) {
                if (!input.values[index]) {
                    input.values[index] = {};
                }
                input.values[index].old = {
                    value: value.value,
                    lang: value.lang
                };
                input.values[index].current = {
                    value: value.value,
                    lang: value.lang,
                };
                input.values[index].uniqueId = _.uniqueId();
            }
        }

        function setIdValues(values, input) {
            if (values.length > 0) {
                var idx;
                for (idx = 0; idx < values.length; idx++) {
                    input.values[idx].old = {
                        value: values[idx].id
                    };
                    input.values[idx].current = {
                        value: values[idx].id,
                    };
                    input.values[idx].uniqueId = _.uniqueId();
                    input.values[idx].index = idx;
                }
            }
        }

        function setIdValue(id, input, index, predicate) {
            input.values = input.values || [];
            if (!input.values[index]) {
                input.values[index] = {};
            }
            if (predicate) {
                input.values[index].predicate = predicate;
            }
            input.values[index].old = {
                value: id
            };
            input.values[index].current = {
                value: id,
            };
            input.values[index].uniqueId = _.uniqueId();
        }

        function setDomain(input, index, domain) {
            input.values = input.values || [];
            if (!input.values[index]) {
                input.values[index] = {};
            }
            input.values[index].domain = domain;
        }

        function setDisplayValue(input, index, property) {
            axios.get(input.values[index].current.value).then(function (response) {
                var graphData = ensureJSON(response.data);
                var root = ldGraph.parse(graphData).byId(input.values[index].current.value);
                var displayValue = root.getAll(property)[0];
                if (typeof displayValue !== undefined) {
                    input.values[index].current.displayValue = displayValue.value;
                }
            }).then(function () {
                ractive.update();
            });
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
                history.replaceState("", "", URI.build(oldUri));
            }
        }

        function loadLabelsForAuthorizedValues(values, input, index) {
            var promises = [];
            if (input.nameProperties) {
                _.each(values, function (uri) {
                    promises.push(axios.get(proxyToServices(uri)).then(function (response) {
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
                        _.each(names, function (nameParts) {
                            var label = nameParts.join(" - ");
                            ractive.set("authorityLabels." + uri.replace(/[:\/\.]/g, "_"), label);
                            input.values[index].current.displayName = label;
                            ractive.update();
                            $("#sel_" + input.values[index].uniqueId).trigger("change");
                        });
                    }));
                });
            }
            return promises;
        }

        var loadExistingResource = function (resourceUri, options) {
            return axios.get(resourceUri)
                .then(function (response) {
                        var graphData = ensureJSON(response.data);

                        var type = StringUtil.titelize(/^.*\/(work|person|publication)\/.*$/g.exec(resourceUri)[1]);
                        var root = ldGraph.parse(graphData).byType(type)[0];

                        var inputsToLoad = [];
                        _.each(ractive.get("inputGroups"), function (group) {
                            _.each(group.inputs, function (input) {
                                if (input.subInputs) {
                                    _.each(input.subInputs, function (subInput) {
                                        inputsToLoad.push(subInput.input);
                                    });
                                } else {
                                    inputsToLoad.push(input);
                                }
                            })
                        });

                        function skipProperty(fragment) {
                            return _.contains(_.values(_.pick(options, "leaveUnchanged")), fragment);
                        }

                        var promises = [];
                        _.each(inputsToLoad, function (input, inputIndex) {
                            if ((type == unPrefix(input.domain) || _.contains((input.subjects), type))
                                || (input.isSubInput && (type === input.parentInput.domain || _.contains(input.parentInput.subjectTypes, type)))
                                && !(skipProperty(input.fragment))) {
                                var predicate = input.predicate;
                                var actualRoots = input.isSubInput ? root.outAll(propertyName(input.parentInput.predicate)) : [root];
                                _.each(actualRoots, function (root, index) {
                                    if (_.contains(["select-authorized-value", "entity", "searchable-authority"], input.type)) {
                                        var values = setMultiValues(root.outAll(propertyName(predicate)), input, index);
                                        promises = _.union(promises, loadLabelsForAuthorizedValues(values, input, index));
                                    } else if (input.type === "searchable-person") {
                                        _.each(root.outAll(propertyName(predicate)), function (node) {
                                            setIdValue(node.id, input, index);
                                            setDisplayValue(input, index, "name");
                                        })
                                    } else if (input.type === "select-predefined-value") {
                                        setMultiValues(root.outAll(propertyName(predicate)), input, index);
                                    } else {
                                        setSingleValue(root.getAll(propertyName(predicate))[0], input, index);
                                    }
                                    if (input.isSubInput) {
                                        input.values[index].nonEditable = true;
                                        input.values[index].subjectType = type;
                                        input.parentInput.allowAddNewButton = true;
                                    }
                                });
                                var mainInput = input.isSubInput ? input.parentInput : input;
                                mainInput.subjectType = type;
                                if (mainInput.multiple) {
                                    if (typeof mainInput.addNewHandledBySelect2 !== 'undefined' && !mainInput.addNewHandledBySelect2) {
                                        console.log("setting allowAddNewButton to true " + mainInput.addNewHandledBySelect2)
                                        mainInput.allowAddNewButton = true;
                                    }
                                }
                            }
                        });
                        Promise.all(promises).then(function () {
                            ractive.update();
                            ractive.set("save_status", "åpnet eksisterende ressurs");
                            ractive.set("targetUri." + type, resourceUri);
                            updateBrowserLocation(type, resourceUri);
                        })
                    }
                )
            //.catch(function (err) {
            //    console.log("HTTP GET existing resource failed with:");
            //    console.log(err);
            //});
        };

        var saveNewResourceFromInputs = function (resourceType) {
            // collect inputs related to resource type

            var inputsToSave = [];
            _.each(ractive.get("inputGroups"), function (group) {
                _.each(group.inputs, function (input) {
                    if (resourceType === input.rdfType) {
                        inputsToSave.push(input);
                    }
                })
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
                        var predicate = input.predicate;
                        _.each(input.values, function (value) {
                            Main.patchResourceFromValue(resourceUri, predicate, value, input.datatype, errors);
                        })
                    });
                    ractive.update();
                })
                .then(function () {
                    loadExistingResource(ractive.get("targetUri." + resourceType));
                })
            //.catch(function (err) {
            //    console.log("POST to " + resourceType.toLowerCase() + " fails: " + err);
            //    errors.push(err);
            //    ractive.set("errors", errors);
            //});
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

    function createInputForCompoundInput(prop, tab, ontologyUri, inputMap) {
            var currentInput = {
                type: "compound",
                label: prop.label,
                domain: tab.rdfType,
                subjectTypes: prop.subjects,
                subjectType: undefined,
                allowAddNewButton: false,
                subInputs: [],
                predicate: ontologyUri + prop.subInputs.rdfProperty,
                range: prop.subInputs.range
            };
            _.each(prop.subInputs.inputs, function (subInput) {
                var inputFromOntology = inputMap[prop.subInputs.range + "." + ontologyUri + subInput.rdfProperty];
                currentInput.subInputs.push({
                        label: subInput.label,
                        input: _.extend(inputFromOntology, {
                            type: subInput.type || inputFromOntology.type,
                            isSubInput: true,
                            parentInput: currentInput,
                            searchable: inputFromOntology.searchable,
                            indexType: subInput.indexType,
                            indexDocumentFields: subInput.indexDocumentFields,
                            nameProperties: subInput.nameProperties,
                            dataAutomationId: inputFromOntology.dataAutomationId
                        }),
                        parentInput: currentInput
                    }
                );
            });
            return currentInput;
        }

        function transferInputGroupOptions(prop, currentInput) {
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
            currentInput.visible = prop.type !== 'entity';
            if (prop.nameProperties) {
                currentInput.nameProperties = prop.nameProperties;
            }
            if (prop.dataAutomationId) {
                currentInput.dataAutomationId = prop.dataAutomationId;
            }
            if (prop.subjects) {
                currentInput.subjects = prop.subjects;
            }
            if (prop.widgetOptions) {
                currentInput.widgetOptions = prop.widgetOptions;
            }
            if (prop.isMainEntry) {
                currentInput.isMainEntry = prop.isMainEntry;
            }
            if (prop.cssClassPrefix) {
                currentInput.cssClassPrefix = prop.cssClassPrefix;
            } else {
                currentInput.cssClassPrefix = 'default';
            }
        }

        function markFirstAndLastInputsInGroup(group) {
            _.findWhere(group.inputs, {visible: true}).firstInGroup = true;

            group.inputs[_.findLastIndex(group.inputs, function (input) {
                return input.visible === true;
            })].lastInGroup = true;
        }

    function assignInputTypeFromRange(input){
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
                case "deichman:Publisher":
                case "deichman:Role":
                case "deichman:Serial":
                case "deichman:Contribution":
                case "deichman:SerialIssue":
                    // TODO infer from ontology that this is an URI
                    // (because deichman:Work a rdfs:Class)
                    input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
                    input.type = "input-string"; // temporarily
                    break;
                default:
                    throw "Don't know which input-type to assign to range: " + input.range;
            }
        }

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

                // Fetch predefined values, if required
                var predicate = Ontology.resolveURI(applicationData.ontology, props[i]["@id"]);
                var valuesFrom = props[i]["http://data.deichman.no/utility#valuesFrom"];
                if (valuesFrom) {
                    var url = valuesFrom["@id"];
                    predefinedValues.push(loadPredefinedValues(url, props[i]["@id"]))
                }
                if (!props[i]["rdfs:range"]) {
                    debugger;
                }
                var datatype = props[i]["rdfs:range"]["@id"];
                var domains = props[i]["rdfs:domain"];
                _.each(domains, function (domain) {
                    if (_.isObject(domain)) {
                        domain = domain['@id'];
                    }
                    var predefined = valuesFrom ? true : false;
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
                        search_result: null,
                        allowAddNewButton: false,
                        values: [{
                            old: {value: "", lang: ""},
                            current: {value: predefined ? [] : null, lang: ""},
                            uniqueId: _.uniqueId()
                        }],
                        dataAutomationId: unPrefix(domain) + "_" + predicate + "_0",
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
                            case "deichman:Publisher":
                            case "deichman:Role":
                            case "deichman:Serial":
                            case "deichman:Contribution":
                            case "deichman:SerialIssue":
                                // TODO infer from ontology that this is an URI
                                // (because deichman:Work a rdfs:Class)
                                input.datatype = "http://www.w3.org/2001/XMLSchema#anyURI";
                                input.type = "input-string"; // temporarily
                                break;
                            default:
                                throw "Don't know which input-type to assign to range: " + input.range;
                        }
                    }
                    inputs.push(input);
                    inputMap[unPrefix(domain) + "." + input.predicate] = input;
                });
            }
            var inputGroups = [];
            var ontologyUri = applicationData.ontology["@context"]["deichman"];
            var tabs = applicationData.config.tabs;
            _.each(tabs, function (tab) {
                var group = {};
                var groupInputs = [];
                _.each(tab.inputs, function (prop, index) {
                    var currentInput;
                    if (prop.rdfProperty) {
                        currentInput = inputMap[tab.rdfType + "." + ontologyUri + prop.rdfProperty];
                        if (typeof currentInput === 'undefined') {
                            throw "Tab '" + tab.label + "' specified unknown property '" + prop.rdfProperty + "'";
                        }
                    } else if (prop.subInputs) {
                        currentInput = createInputForCompoundInput(prop, tab, ontologyUri, inputMap);
                    } else {
                        throw "Input #" + index + " of tab '" + tab.label + "' must have rdfProperty";
                    }

                    if (tab.rdfType === unPrefix(currentInput.domain)) {
                        groupInputs.push(currentInput);
                        currentInput.rdfType = tab.rdfType;
                    }
                    transferInputGroupOptions(prop, currentInput);
                });
                group.inputs = groupInputs;
                group.tabLabel = tab.label;
                group.tabId = tab.id;
                group.tabSelected = false;
                group.domain = tab.rdfType;

                if (tab.nextStep) {
                    group.nextStep = tab.nextStep;
                }

                markFirstAndLastInputsInGroup(group);
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

        function parentOf(keypath) {
            return _.initial(keypath.split(".")).join(".");
        }

        /* public API */
        function visitInputs(mainInput, visitor) {
            _.each(mainInput.subInputs ? _.pluck(mainInput.subInputs, "input") : [mainInput], visitor);
        }

        function positionSupportPanels() {
            $("span.support-panel").each(function (index, panel) {
                var supportPanelBaseId = $(panel).attr("data-support-panel-base-ref");
                var dummyPanel = $("#right-dummy-panel");
                var supportPanelLeftEdge = dummyPanel.position().left;
                var supportPanelWidth = dummyPanel.width();
                $(panel).css({
                    top: $("#" + supportPanelBaseId).position().top - 15,
                    left: supportPanelLeftEdge,
                    width: supportPanelWidth
                });
            });
        }


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
                                if (cur) {
                                    ractive.set(keypath + ".old.value", cur.value);
                                    ractive.set(keypath + ".old.lang", cur.lang);
                                }

                            }
                            ractive.set("save_status", "alle endringer er lagret");
                            ractive.update();
                        })
                    //.catch(function (response) {
                    //    // failed to patch resource
                    //    console.log("HTTP PATCH failed with: ");
                    //    errors.push("Noe gikk galt! Fikk ikke lagret endringene");
                    //    ractive.set("save_status", "");
                    //});
                }
            },
            init: function () {
                var template = "/main_template.html";
                //window.onerror = function (message, url, line) {
                //    // Log any uncaught exceptions to assist debugging tests.
                //    // TODO remove this when everything works perfectly (as if...)
                //    console.log('ERROR: "' + message + '" in file: ' + url + ', line: ' + line);
                //};

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

                function patchObject(input, applicationData, index, operation) {
                    var patch = [];
                    var actualSubjectType = _.first(input.subInputs).input.values[index].subjectType || input.subjectType || input.rdfType;
                    var mainSubject = ractive.get("targetUri." + actualSubjectType);
                    patch.push({
                        op: operation,
                        s: mainSubject,
                        p: input.predicate,
                        o: {
                            value: "_:b0",
                            type: "http://www.w3.org/2001/XMLSchema#anyURI"
                        }
                    });
                    if (input.range) {
                        patch.push({
                            op: operation,
                            s: "_:b0",
                            p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                            o: {
                                value: applicationData.ontology["@context"]["deichman"] + input.range,
                                type: "http://www.w3.org/2001/XMLSchema#anyURI"
                            }
                        })
                    }
                    _.each(input.subInputs, function (subInput) {
                        var value = subInput.input.values[index].current.value;
                        patch.push({
                            op: operation,
                            s: "_:b0",
                            p: subInput.input.predicate,
                            o: {
                                value: _.isArray(value) ? value[0] : value,
                                type: subInput.input.datatype
                            }
                        });
                    });
                    ractive.set("save_status", "arbeider...");
                    return axios.patch(mainSubject, JSON.stringify(patch), {
                            headers: {
                                Accept: "application/ld+json",
                                "Content-Type": "application/ldpatch+json"
                            }
                        })
                        .then(function (response) {
                            // successfully patched resource
                            ractive.set("save_status", "alle endringer er lagret");
                        })
                    //.catch(function (response) {
                    //    // failed to patch resource
                    //    console.log("HTTP PATCH failed with: ");
                    //    errors.push("Noe gikk galt! Fikk ikke lagret endringene");
                    //    ractive.set("save_status", "");
                    //});
                }

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
                                            q: params.term + "*", // search term
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

                        // decorators
                        var repositionSupportPanel = function (node) {
                            //$(node).find(".support-panel").css({top: $(node).position().top})
                            Main.repositionSupportPanelsHorizontally();
                            return {
                                teardown: function () {
                                }
                            }
                        };
                        var detectChange = function (node) {
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
                                    if (!inputNode.isSubInput) {
                                        Main.patchResourceFromValue(ractive.get("targetUri." + inputNode.rdfType), inputNode.predicate,
                                            ractive.get(keypath), inputNode.datatype, errors, keypath);
                                    }
                                }
                            });
                            return {
                                teardown: function () {
                                }
                            }
                        };
                        var handleAddNewBySelect2 = function (node) {
                            var inputKeyPath = grandParentOf(Ractive.getNodeInfo(node).keypath);
                            ractive.set(inputKeyPath + ".allowAddNewButton", false);
                            ractive.set(inputKeyPath + ".addNewHandledBySelect2", true);
                            return {
                                teardown: function () {
                                }
                            }
                        };
                        var clickOutsideSupportPanelDetector = function (node) {
                            $(document).click(function (event) {
                                if (!$(event.target).closest("span.support-panel").length && !$(event.target).is("span.support-panel")) {
                                    clearSearchResults();
                                }
                            });
                            return {
                                teardown: function () {
                                }
                            }
                        };

                        // Initialize ractive component from template
                        ractive = new Ractive({
                            el: "container",
                            lang: "no",
                            template: applicationData.template,
                            data: {
                                applicationData: applicationData,
                                predefinedValues: applicationData.predefinedValues,
                                errors: errors,
                                resource_type: "",
                                resource_label: "",
                                ontology: null,
                                search_result: null,
                                config: applicationData.config,
                                save_status: "ny ressurs",
                                authorityLabels: {},
                                getAuthorityLabel: function (uri) {
                                    return ractive.get("authorityLabels")[uri];
                                },
                                urlEscape: function (url) {
                                    return url.replace(/[:\/\.]/g, "_");
                                },
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
                                readyToAddRole: function (node) {
                                    return true;
                                },
                                spy: function (node) {
                                    console.log("spy: " + node.keypath);
                                },
                                predefinedLabelValue: function (type, uri) {
                                    return i18nLabelValue(_.find(ractive.get("predefinedValues." + type), function (predefinedValue) {
                                        return predefinedValue['@id'] === uri;
                                    })['rdfs:label']);
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
                                subjectTypeLabel: function (subject) {
                                    var resourceLabel = Ontology.resourceLabel(applicationData.ontology, subject, 'no');
                                    return resourceLabel || "";
                                },
                                subjectTypeLabelDet: function (subjectType) {
                                    switch (subjectType) {
                                        case "Work":
                                            return "verket";
                                        case "Publication":
                                            return "utgivelsen";
                                        default:
                                            return subjectType;
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
                                repositionSupportPanel: repositionSupportPanel,
                                detectChange: detectChange,
                                handleAddNewBySelect2: handleAddNewBySelect2,
                                clickOutsideSupportPanelDetector: clickOutsideSupportPanelDetector
                            }
                        });
                        ractive.on({
                                // addValue adds another input field for the predicate.
                                addValue: function (event) {
                                    var mainInput = ractive.get(event.keypath);
                                    visitInputs(mainInput, function (input) {
                                        input.values[input.values.length] = {
                                            old: {value: "", lang: ""},
                                            current: {value: "", lang: ""},
                                            uniqueId: _.uniqueId()
                                        };
                                        input.search_result = null;
                                    });
                                    ractive.update();
                                    ractive.set(event.keypath + ".allowAddNewButton", false);
                                    console.log("setting " + event.keypath + ".allowAddNewButton to false");
                                    positionSupportPanels();
                                },
                                // patchResource creates a patch request based on previous and current value of
                                // input field, and sends this to the backend.
                                patchResource: function (event, predicate, rdfType, clearProperty) {
                                    var input = ractive.get(grandParentOf(event.keypath));
                                    if (!input.isSubInput) {
                                        var inputValue = event.context;
                                        if (inputValue.error || (inputValue.current.value === "" && inputValue.old.value === "")) {
                                            return;
                                        }
                                        var datatype = event.keypath.substr(0, event.keypath.indexOf("values")) + "datatype";
                                        var subject = ractive.get("targetUri." + rdfType);
                                        if (subject) {
                                            Main.patchResourceFromValue(subject, predicate, inputValue, ractive.get(datatype), errors, event.keypath);
                                            event.context.domain = rdfType;
                                            input.allowAddNewButton = true;
                                        }
                                        if (clearProperty) {
                                            ractive.set(grandParentOf(event.keypath) + "." + clearProperty, null);
                                        }
                                        ractive.update();
                                    }
                                },
                                saveObject: function (event, index) {
                                    var input = event.context;
                                    patchObject(input, applicationData, index, "add").then(function () {
                                        visitInputs(input, function (input) {
                                            if (input.isSubInput) {
                                                _.each(input.values, function (value) {
                                                    value.nonEditable = true;
                                                });
                                            }
                                        });
                                        input.allowAddNewButton = true;
                                        ractive.update();
                                        var subInputs = grandParentOf(event.keypath);
                                        _.each(event.context.subInputs, function (input, subInputIndex) {
                                            if (_.contains(["select-authorized-value", "entity", "searchable-authority"], input.input.type)) {
                                                var valuesKeypath = subInputs + "." + subInputIndex + ".input.values." + index + ".current.value.0";
                                                loadLabelsForAuthorizedValues([ractive.get(valuesKeypath)], input.input, index);
                                            }
                                        });
                                    });

                                },
                                deleteObject: function (event, parentInput, index) {
                                    patchObject(parentInput, applicationData, index, "del").then(function () {
                                        var subInputs = grandParentOf(grandParentOf(event.keypath));
                                        _.each(parentInput.subInputs, function (input, subInputIndex) {
                                            ractive.get(subInputs + "." + subInputIndex + ".input.values").splice(index, 1);
                                        });
                                        ractive.update();
                                        if (ractive.get(subInputs + ".0.input.values").length === 0) {
                                            var addValueEvent = {keypath: parentOf(subInputs)};
                                            ractive.fire("addValue", addValueEvent);
                                        }
                                    })
                                },
                                searchResource: function (event, searchString) {
                                    // TODO: searchType should be deferred from predicate, fetched from ontology by rdfs:range
                                    var searchType = "person";
                                    var searchURI = ractive.get("config.resourceApiUri") + "search/" + searchType + "/_search";
                                    var searchData = {
                                        query: {
                                            match: {
                                                'person.name': {
                                                    query: searchString + "*",
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
                                                if (person.work) {
                                                    if (!_.isArray(person.work)) {
                                                        person.work = [person.work];
                                                    }
                                                    _.each(person.work, function (work) {
                                                        work.isChecked = false;
                                                    });
                                                }
                                            });
                                            ractive.set(grandParentOf(event.keypath) + ".search_result", {
                                                results: results,
                                                origin: event.keypath
                                            });
                                        });
                                    //    .catch(function (err) {
                                    //    console.log(err);
                                    //});
                                },
                                toggleWork: function (event) {
                                    var keypath = event.keypath + '.toggleWork';
                                    ractive.get(keypath) !== true ?
                                        ractive.set(keypath, true) :
                                        ractive.set(keypath, false);
                                },
                                selectPersonResource: function (event, origin) {
                                    var inputKeyPath = grandParentOf(origin);
                                    var input = ractive.get(inputKeyPath);
                                    var uri = event.context.uri;
                                    var name = event.context.name;
                                    if (input.isMainEntry) {
                                        loadExistingResource(uri);
                                    }
                                    ractive.set(origin + ".old.value", ractive.get(origin + ".current.value"));
                                    ractive.set(origin + ".current.value", uri);
                                    ractive.set(origin + ".current.displayValue", name);
                                    ractive.set(origin + ".deletable", true);
                                    ractive.set(origin + ".searchable", false);
                                    _.each(input.dependentResourceTypes, function (resourceType) {
                                        unloadResourceForDomain(resourceType);
                                    });
                                },
                                selectWorkResource: function (event) {
                                    var uri = event.context.uri;
                                    unloadResourceForDomain("Publication");
                                    loadExistingResource(uri, {leaveUnchanged: "creator"});
                                },
                                setResourceAndWorkResource: function (event, person, origin, domainType) {
                                    ractive.fire("selectPersonResource", {context: person}, origin, domainType);
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
                                    positionSupportPanels();
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
                            }
                        );

                        ractive.observe("inputGroups.*.inputs.*.values.*", function (newValue, oldValue, keypath) {
                            if (newValue && newValue.current) {
                                if (!newValue.current.value) {
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
                    }
                    ;

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
                    if (creatorUri !== "") {
                        return loadExistingResource(creatorUri).then(function () {
                            ractive.set("targetUri.Person", creatorUri);
                        });
                    }
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
                //.catch(function (err) {
                //    console.log("Error initiating Main: " + err);
                //});
            },
            repositionSupportPanelsHorizontally: function () {
                var supportPanelLeftEdge = $("#right-dummy-panel").position().left;
                var supportPanelWidth = $("#right-dummy-panel").width();

                $(".support-panel").each(function (index, panel) {
                    $(panel).css({left: supportPanelLeftEdge, width: supportPanelWidth});
                });
            }
            ,
            getRactive: function () {
                return ractive;
            }
        }
        return Main;
    }
));

