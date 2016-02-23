(function (root, factory) {
    "use strict";
    if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        var _ = require("underscore");

        module.exports = factory(_);
    } else {
        // Browser globals (root is window)
        root.Ontology = factory(root._);
    }
}(this, function (_) {
    "use strict";
    var Ontology = {

        // propsByClass extract the properties from the ontology which are valid for a given class.
        // This includes properties with unspecified domain (applicable for all classes), and those
        // with specified range as the given class.
        propsByClass: function (ontology, cls) {
            var res = [];
            ontology["@graph"].forEach(function (p) {
                if (p["@type"] === "rdfs:Property") {
                    if (p["rdfs:domain"] === undefined || cls === undefined || p["rdfs:domain"]["@id"] === "rdfs:Class") {
                        res.push(p);
                    } else if (Array.isArray(p["rdfs:domain"])) {
                        p["rdfs:domain"].forEach(function (q) {
                            if (q["@id"] === ("deichman:" + cls)) {
                                res.push(p);
                            }
                        });
                    } else if (p["rdfs:domain"]["@id"] === ("deichman:" + cls)) {
                        res.push(p);
                    }
                }
            });
            return res;
        },

        allProps: function (ontology) {
            return this.propsByClass(ontology);
        },

        // resolveURI resolves a URI in prefixed form to its full form, according to prefixes specified
        // in the ontology.
        resolveURI: function (ontology, uri) {
            var i = uri.indexOf(":");
            var prefix = uri.substr(0, i);
            for (var k in ontology["@context"]) {
                if (prefix === k) {
                    return ontology["@context"][k] + uri.substr(i + 1);
                }
            }
        },

        // validateLiteral checks that a given value conforms to it's xsd:range(datatype).
        validateLiteral: function (value, range) {
            switch (range) {
                case "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString":
                case "http://www.w3.org/2001/XMLSchema#string":
                    return true; // a javscript string is always valid as xsd:string
                case "http://www.w3.org/2001/XMLSchema#gYear":
                    // According to its specification, a xsd:gYear allows time-zone information, but
                    // we don't want that, and only accepts negative (BCE) or positive (CE) integers.
                    // TODO shall we require 0-padding - i.e not allow "92" but require "0092"?
                    return /^-?(\d){1,4}$/.test(value);
                case "http://www.w3.org/2001/XMLSchema#nonNegativeInteger":
                    return /^\+?(\d)+$/.test(value);
                default:
                    var err = "don't know how to validate literal of range: <" + range + ">";
                    return true;
            }
        },

        // createPatch creates a patch request for a given subject, predicate and value (el)
        // as it is represented in the client UI.
        createPatch: function (subject, predicate, oldAndCurrentValue, datatype) {
            var addPatches = [],
                delPatches = [];

            var currentValue = oldAndCurrentValue.current.value;
            var oldValue = oldAndCurrentValue.old.value;
            if (_.isArray(oldValue) && !_.isArray(currentValue)) {
                currentValue = [currentValue];
            }
            if (typeof currentValue == 'string' && currentValue != oldValue) {
                if (currentValue !== "") {
                    var addPatch = {op: "add", s: subject, p: predicate, o: {value: currentValue, type: datatype}};
                    if (oldAndCurrentValue.current.lang !== "") {
                        addPatch.o.lang = oldAndCurrentValue.current.lang;
                    }
                    addPatches.push(addPatch);
                }

                if (oldValue !== "") {
                    var delPatch = {op: "del", s: subject, p: predicate, o: {value: oldValue}};
                    if (oldAndCurrentValue.old.lang !== "") {
                        delPatch.o.lang = oldAndCurrentValue.old.lang;
                    }

                    delPatch.o.type = datatype;
                    delPatches.push(delPatch);
                }
            } else {
                if (_.isArray(currentValue) || _.isArray(oldValue)) {
                    var addValues = _.difference(currentValue, oldValue);
                    _.each(addValues, function (value) {
                        addPatches.push({op: "add", s: subject, p: predicate, o: {value: value, type: datatype}});
                    });

                    var delValues = _.difference(oldValue, currentValue);
                    _.each(delValues, function (value) {
                        delPatches.push({op: "del", s: subject, p: predicate, o: {value: value}});
                    });
                }
            }

            return JSON.stringify(_.union(delPatches, addPatches));
        },

        // extractValues extracts the values (properties) from the given resource in JSON-LD format,
        // and returns them in the format which the client UI uses.
        extractValues: function (resource) {
            var values = {};
            for (var prop in resource) {
                switch (prop) {
                    case "@id":
                    case "@type":
                    case "@context":
                        break;
                    default:
                        // unify string/object into an array
                        if (!Array.isArray(resource[prop])) {
                            resource[prop] = [resource[prop]];
                        }

                        var predicate = this.resolveURI(resource, prop);
                        values[predicate] = [];
                        for (var v in resource[prop]) {
                            var val = resource[prop][v];
                            if (typeof val === "string") {
                                values[predicate].push({
                                    old: {value: val, lang: ""},
                                    current: {value: val, lang: ""}
                                });
                            } else if (typeof val === "object") {
                                var temp = val["@value"];
                                if (val["@id"]) {
                                    temp = val["@id"];
                                }
                                values[predicate].push({
                                    old: {value: temp, lang: val["@language"]},
                                    current: {value: temp, lang: val["@language"]}
                                });
                            }
                        }
                }
            }

            return values;
        },

        resourceLabel: function (ontology, cls, lang) {
            var clazz = ontology["@graph"].filter(
                function (e) {
                    return e["@id"] == "deichman:" + cls;
                }
            );
            return clazz.length > 0 ? clazz[0]["rdfs:label"].filter(
                function (e) {
                    return e["@language"] == lang;
                })[0]["@value"] : "";
        }
    };

    return Ontology;
}));
