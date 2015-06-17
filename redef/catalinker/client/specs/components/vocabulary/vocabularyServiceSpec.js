describe("catalinker.vocabulary", function () {
    'use strict';

    beforeEach(function () {
        module('catalinker.vocabulary');
    });

    describe("VocabularyService", function() {

        describe("replaceContextInUri", function() {

            it("should replace context in uri", function() {
                var vocabulary,
                    contextHash = {
                    "something": "http://deichman.no/something#",
                    "": "http://deichman.no/nothing#"
                };

                inject(function (_vocabulary_) {
                    vocabulary = _vocabulary_;
                });

                expect(vocabulary.replaceContextInUri(contextHash, "something:something"))
                    .toBe("http://deichman.no/something#something");

                expect(vocabulary.replaceContextInUri(contextHash, ":anything"))
                    .toBe("http://deichman.no/nothing#anything");

                expect(vocabulary.replaceContextInUri(contextHash, "whatever:not_found"))
                    .toBe("whatever:not_found");
            });
        });

        describe("labels", function () {
            var minimalOntology = {
                "@context": {
                    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                    "ls-ext": "http://deichman.no/ontology#"
                },
                "@graph": [
                    {
                        "@id": "http://deichman.no/ontology#Work",
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
                        "@id": "ls-ext:name",
                        "rdfs:label": "Name/navn"
                    }
                ]};

            beforeEach(function () {
                module(function ($provide) {
                    $provide.factory('ontologyFactory', function ($q) {
                        var dfd = $q.defer();
                        dfd.resolve(minimalOntology);
                        return dfd.promise;
                    });
                });
            });

            it("should convert ontology into list of labels", function (done) {

                inject(function (vocabulary) {
                    vocabulary.labels.then(function(labels) {
                        expect(labels['http://deichman.no/ontology#Work']['default']).toBe('Verk');
                        expect(labels['http://deichman.no/ontology#name']['default']).toBe('Name/navn');
                        expect(Object.keys(labels).length).toBe(2);
                        done();
                    }, function() {
                        fail();
                    });
                });

                inject(function ($rootScope) {
                    $rootScope.$apply();
                    $rootScope.$digest();
                });
            });
        });
    });
});
