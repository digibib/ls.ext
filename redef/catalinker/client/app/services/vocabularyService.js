(function() {

    var vocabularyResponse = {
        "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "ls-ext": "http://deichman.no/ontology#"
        },
        "@graph": [
            {
                "@id": "http://deichman.no/ontology#Work",
                "@type": "rdfs:Class",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "A work is the result of a creative effort"
                    },
                    {
                        "@language": "no",
                        "@value": "Et verk er resultatet av kreativt arbeid"
                    }
                ],
                "rdfs:label": [
                    {
                        "@language": "en",
                        "@value": "Work"
                    },
                    {
                        "@language": "no",
                        "@value": "Verk"
                    }
                ]
            },
            {
                "@id": "http://deichman.no/ontology#Person",
                "@type": "rdfs:Class",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "A person is a being that has the attributes generally associated with personhood"
                    },
                    {
                        "@language": "no",
                        "@value": "En person er et vesen som har attributtene generelt assosiert med personer"
                    }
                ],
                "rdfs:label": [
                    {
                        "@language": "no",
                        "@value": "Person"
                    },
                    {
                        "@language": "en",
                        "@value": "Person"
                    }
                ]
            },
            {
                "@id": "http://deichman.no/ontology#biblioId",
                "@type": "rdfs:Property",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "The relationship between a work and a ls.ext-internal Koha-record identifier"
                    },
                    {
                        "@language": "no",
                        "@value": "Relasjonen mellom et verk og en ls.ext-intern identifikator for en Koha-post"
                    }
                ],
                "rdfs:domain": {
                    "@id": "http://deichman.no/ontology#Work"
                },
                "rdfs:label": [
                    {
                        "@language": "no",
                        "@value": "biblio ID"
                    },
                    {
                        "@language": "en",
                        "@value": "biblio ID"
                    }
                ],
                "rdfs:range": {
                    "@id": "xsd:nonNegativeInteger"
                }
            },
            {
                "@id": "http://deichman.no/ontology#name",
                "@type": "rdfs:Property",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "The relationship between a thing and what it is called"
                    },
                    {
                        "@language": "no",
                        "@value": "Relasjonen mellom en ting og det den er kalt"
                    }
                ],
                "rdfs:domain": {
                    "@id": "rdfs:Class"
                },
                "rdfs:label": [
                    {
                        "@language": "no",
                        "@value": "navn"
                    },
                    {
                        "@language": "en",
                        "@value": "name"
                    }
                ],
                "rdfs:range": {
                    "@id": "xsd:string"
                }
            },
            {
                "@id": "http://deichman.no/ontology#identifier",
                "@type": "rdfs:Property",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "The relationship between a thing and an attribute which uniquely identifies it in a given context"
                    },
                    {
                        "@language": "no",
                        "@value": "Relasjonen mellom en ting og en attribut som unikt identifiserer den i en gitt kontekst"
                    }
                ],
                "rdfs:label": [
                    {
                        "@language": "en",
                        "@value": "identifier"
                    },
                    {
                        "@language": "no",
                        "@value": "identifikator"
                    }
                ],
                "rdfs:range": {
                    "@id": "xsd:string"
                }
            },
            {
                "@id": "http://deichman.no/ontology#creator",
                "@type": "rdfs:Property",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "The relationship between a creative work and the person who created it"
                    },
                    {
                        "@language": "no",
                        "@value": "Relasjonen mellom et kreativt arbeid og personen som har skapt det"
                    }
                ],
                "rdfs:domain": {
                    "@id": "http://deichman.no/ontology#Work"
                },
                "rdfs:label": [
                    {
                        "@language": "no",
                        "@value": "skaper"
                    },
                    {
                        "@language": "en",
                        "@value": "creator"
                    }
                ],
                "rdfs:range": {
                    "@id": "http://deichman.no/ontology#Person"
                }
            },
            {
                "@id": "http://deichman.no/ontology#date",
                "@type": "rdfs:Property",
                "rdfs:comment": [
                    {
                        "@language": "en",
                        "@value": "The relationship between a work and the year it was created"
                    },
                    {
                        "@language": "no",
                        "@value": "Relasjonen mellom et verk og året det ble skapt"
                    }
                ],
                "rdfs:domain": {
                    "@id": "http://deichman.no/ontology#Work"
                },
                "rdfs:label": [
                    {
                        "@language": "en",
                        "@value": "date"
                    },
                    {
                        "@language": "no",
                        "@value": "dato"
                    }
                ],
                "rdfs:range": {
                    "@id": "xsd:gYear"
                }
            }
        ]
    };


    angular.module('app')
    .factory('$vocabulary', ['$q', function($q) {
        var context = vocabularyResponse['@context'],
            reverseContext = {},
            vocab = vocabularyResponse['@graph'],
            labelIndex = {},
            deferred = $q.defer();
        
        function replaceUriWithContext(uri) {
            var result = uri;
            angular.forEach(context, function(c) {
                if (uri.indexOf(c) === 0) {
                    result = c;
                }
            });
            return result;
        }

        function init() {
            angular.forEach(context, function(value, key) {
                reverseContext[value] = key;
            });

            vocab.forEach(function (obj) {
                var label = {
                        'default': obj['rdfs:label']
                    },
                    comment = {
                        'default': obj['rdfs:comment']
                   };
                if (obj['rdfs:label'] instanceof Array) {
                    obj['rdfs:label'].forEach(function(l) {
                        label[l['@language']] = l['@value'];
                    });
                    label['default'] = label['no'] || label['en'];
                }
                if (obj['rdfs:comment'] instanceof Array) {
                    obj['rdfs:comment'].forEach(function (c) {
                        comment[c['@language']] = c['@value'];
                    });
                    comment['default'] = comment['no'] || comment['en'];
                }
                //obj['@label']
                labelIndex[obj['@id']] = label;
                labelIndex[replaceUriWithContext(obj['@id'])] = label;
            });
            deferred.resolve();
        }
    /*
        function getLabel(predicate) {
            return labelIndex[predicate] || predicate;
        }
    */
        init();
        return {
            //getLabel: getLabel,
            labels: labelIndex,
            vocabulary: vocabularyResponse['@graph'],
            promise: deferred.promise
        };
    }]);

}());