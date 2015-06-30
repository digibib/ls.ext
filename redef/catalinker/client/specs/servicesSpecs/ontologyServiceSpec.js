/*global beforeEach*/
describe("Given $ontology is started", function () {
    'use strict';
    var $httpBackend,
        configPath = '/config',
        ontologyUri = '',
        $$injector,
        $window,
        $rootScope,
        mocks = {};
    
    function loadMocks() {
        angular.forEach($window.__html__, function (val, path) {
            if (!path || !$window.__html__.hasOwnProperty(path)) {
                return;
            }
            var key = path.substr(path.lastIndexOf('/') + 1);
            key = key.substr(0, key.length - 5); //strip .json
            mocks[key] = val;
        });
    }    

    beforeEach(function() {
        module('catalinker.ontology');
    });

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $window = $injector.get('$window');
        $$injector = $injector;
        loadMocks();
    })); 

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });



    describe("when ontology is used for the first time and ontology is loaded successfully", function () {
        var $ontology, isReady = false;

        beforeEach(function () {
            $ontology = $$injector.get('$ontology');
            $httpBackend.expectGET('/config').respond(200, mocks.config);
            $httpBackend.expectGET(ontologyUri).respond(200, mocks.ontology);
            $ontology.ready.then(function(data) {
                isReady = true;
            });
            $httpBackend.flush();
        });

        it("should be ready", function() {
            expect(isReady).toBe(true);
        });

    });

    describe("when ontology is used for the first time and server fails", function () {
        var $ontology, isReady = false, isError = false;
        
        beforeEach(function () {
            $ontology = $$injector.get('$ontology');
            //$httpBackend.expectGet()
            $httpBackend.expectGET('/config').respond(200, mocks.config);
            $httpBackend.expectGET(ontologyUri).respond(500, '');
            $ontology.ready.then(function (data) {
                isReady = true;
            }, function() {
                isError = true;
            });
            $httpBackend.flush();
        });
        
        it("should not be ready", function () {
            expect(isReady).toBe(false);
        });

        it("should have error", function () {
            expect(isError).toBe(true);
        });

    });

    describe("when ontology is used for the first time and config load from server fails", function () {
        var $ontology, isReady = false, isError = false;
        
        beforeEach(function () {
            $ontology = $$injector.get('$ontology');
            //$httpBackend.expectGet()
            $httpBackend.expectGET('/config').respond(500, '');
            $ontology.ready.then(function (data) {
                isReady = true;
            }, function () {
                isError = true;
            });
            $httpBackend.flush();
        });
        
        it("should not be ready", function () {
            expect(isReady).toBe(false);
        });
        
        it("should have error", function () {
            expect(isError).toBe(true);
        });

    });
    
});


