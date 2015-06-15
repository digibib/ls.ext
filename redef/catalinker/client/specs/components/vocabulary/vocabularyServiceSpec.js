describe("catalinker.vocabulary", function () {
    'use strict';

    beforeEach(function () {
        module('catalinker.vocabulary');
    });

    describe("VocabularyService", function() {
        it("should have an endpoint configured", inject(function(ontologyUri) {
            expect(ontologyUri).toBe('http://192.168.50.12:8005/ontology');
        }));

        describe("ontologyFactory", function() {
            var originalTimeout;

            beforeEach(function() {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
            });


            it("should load ontology from given ontologyUri", function(done) {
                var $rootScope,
                    $httpBackend;

                module(function($provide) {
                    $provide.constant('ontologyUri', 'http://www.example.com/someuri');
                });

                inject(function ($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                });

                inject(function(ontologyUri) {
                    expect(ontologyUri).toBe('http://www.example.com/someuri');
                    $httpBackend.expectGET(ontologyUri).respond(200, "some content");
                });

                inject(function(ontologyFactory) {
                    ontologyFactory.then(function(data) {
                        expect(data).toBe('some content');
                        done();
                    }, function(data) {
                        fail(data);
                    });
                });
                $rootScope.$digest();
                $httpBackend.flush();
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            afterEach(function() {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            });
        });


        describe("vocabularyFactory", function () {

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
            it("should convert minimal ontology into vocabulary", function (done) {
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

                module(function ($provide) {
                    $provide.factory('ontologyFactory', function ($q) {
                        var dfd = $q.defer();
                        dfd.resolve(minimalOntology);
                        return dfd.promise;
                    });
                });

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
});
