describe("catalinker.config", function () {
    'use strict';

    beforeEach(function () {
        module('catalinker.config');
    });

    describe("ConfigService", function() {

        it("should have an config path configured", function () {
            inject(function (configPath) {
                expect(configPath).toBe('/config');
            });
        });

        describe("when config values exist then it", function () {
            var $rootScope,
                $httpBackend,
                myConfigPath = '/someuri',
                myConfig = {
                    "ontologyUri": "another_uri",
                    "resourceApiUri": "yet_another_uri"
                };

            beforeEach(function () {
                module(function($provide) {
                    $provide.constant('configPath', myConfigPath);
                });
            });

            beforeEach(function () {
                inject(function ($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            beforeEach(function () {
                $httpBackend.expectGET(myConfigPath).respond(200, myConfig);
            });

            it("should load ontologyUri", function(done) {
                inject(function(ontologyUri) {
                    ontologyUri.then(function(data) {
                        expect(data).toBe("another_uri");
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

            it("should load resourceApiUri", function(done) {
                inject(function(resourceApiUri) {
                    resourceApiUri.then(function(data) {
                        expect(data).toBe("yet_another_uri");
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
        });

        describe("when config value is missing then", function () {
            var $rootScope,
                myConfig = {
                    "not_the_one_that_we_want": "shite"
                };

            beforeEach(function () {
                module(function($provide) {
                    $provide.factory('config', function ($q) {
                        var deferred = $q.defer();
                        deferred.resolve(myConfig);
                        return deferred.promise;
                    });
                });
            });

            beforeEach(function () {
                inject(function ($injector) {
                    $rootScope = $injector.get('$rootScope');
                });
            });

            it("should fail the ontologyUriPromise", function(done) {
                inject(function(ontologyUri) {
                    ontologyUri.then(function(data) {
                        fail("should not have found: " + data);
                    }, function(error) {
                        // correctly failed
                        done();
                    });
                });
                $rootScope.$digest();
            });
        });

        describe("ontologyFactory", function () {

            it("should load ontology from given ontologyUri", function (done) {
                var $rootScope,
                    $httpBackend;

                module(function ($provide) {
                    $provide.factory('ontologyUri', function ($q) {
                        var def = $q.defer();
                        def.resolve('http://www.example.com/someuri');
                        return def.promise;
                    });
                });

                inject(function ($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                });

                $httpBackend.expectGET('http://www.example.com/someuri').respond(200, "some ontology");

                inject(function (ontologyFactory) {
                    ontologyFactory.then(function (data) {
                        expect(data).toBe('some ontology');
                        done();
                    }, function (data) {
                        fail(data);
                    });
                });
                $rootScope.$digest();
                $httpBackend.flush();
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });
        });
    });
});



