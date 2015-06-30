/*global beforeEach*/
describe("Given $config is started", function () {
    'use strict';
        var $httpBackend,
            myConfigPath = '/config',
            $$injector,
            myConfig = {
                "ontologyUri": "another_uri",
                "resourceApiUri": "yet_another_uri"
        };

    beforeEach(function() {
        module('catalinker.config');
    });

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $$injector = $injector;
    })); 

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("should have an config path configured", function () {
        inject(function (configPath) {
            expect(configPath).toBe('/config');
        });
    });

    describe("when config is used for the first time and config is loaded successfully", function () {
        var $config, cfg;

        beforeEach(function () {
            $config = $$injector.get('$config');
            $httpBackend.expectGET(myConfigPath).respond(200, myConfig);
            $config.ready.then(function(data) {
                cfg = data;
            });
            $httpBackend.flush();
        });

        it("should load ontologyUri", function() {
            expect(cfg.ontologyUri).toBe(myConfig.ontologyUri);
        });

        it("should load resourceApiUri", function() {
            expect(cfg.resourceApiUri).toBe(myConfig.resourceApiUri);
        });
    });
    
    describe("when config is used for the first time and config is not loaded successfully", function () {
        var $config, cfg;
        
        beforeEach(function () {
            $config = $$injector.get('$config');
            $httpBackend.expectGET(myConfigPath).respond(500, '');
            $config.ready.then(function (data) {
                cfg = data;
            },
            function(err) {
                cfg = {};
            });
            $httpBackend.flush();
        });
        
        it("should not not load ontologyUri", function () {
            expect(cfg.ontologyUri).not.toBeDefined(); 
        });
        
        it("should not not load resourceApiUri", function () {
            expect(cfg.resourceApiUri).not.toBeDefined(); 
        });
    });
});


