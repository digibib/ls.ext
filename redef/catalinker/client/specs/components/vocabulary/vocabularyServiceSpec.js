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
    });
});
