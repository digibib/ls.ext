describe("Given catalinker.vocabulary is initalized", function () {
    'use strict';
    var mocks = {},
        ontologyUri = '',
        $injector, 
        $vocabulary,
        $httpBackend,
        $window;
    
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

    beforeEach(function () {
        module('catalinker.config');
        module('catalinker.ontology');
        module('catalinker.vocabulary');
    });
    
    beforeEach(inject(function (_$injector_) {
        $injector = _$injector_;
        $httpBackend = $injector.get('$httpBackend');
        $window = $injector.get('$window');
        loadMocks();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
   


    describe("and $ontology is loaded successfully", function () {
        var vocabulary = null;

        beforeEach(function () {
            $vocabulary = $injector.get('$vocabulary');
            $httpBackend.expectGET('/config').respond(200, mocks.config);
            $httpBackend.expectGET(ontologyUri).respond(200, mocks.ontologytest);
            $vocabulary.ready.then(function (data) {
                vocabulary = data;
            });
            $httpBackend.flush();

        });

        it("vocabulary is returned by ready promise", function() {
            expect(vocabulary).not.toBe(null);
        });

        it("vocabulary contains a Work with fully qualified uri", function () {
            expect(vocabulary["http://deichman.no/ontology#Work"]).toBeDefined();
        });

        it("the work contains a default label", function () {
            expect(vocabulary["http://deichman.no/ontology#Work"]["default"]).toBeDefined();
        });

        it("the work contains an english label", function () {
            expect(vocabulary["http://deichman.no/ontology#Work"]["en"]).toBeDefined();
        });

        it("the work contains a norwegian label", function () {
            expect(vocabulary["http://deichman.no/ontology#Work"]["no"]).toBeDefined();
        });

        it("vocabulary contains a Person with fully qualified uri", function () {
            expect(vocabulary["http://deichman.no/ontology#Person"]).toBeDefined();
        });
        
        it("the Person contains a default label", function () {
            expect(vocabulary["http://deichman.no/ontology#Person"]["default"]).toBeDefined();
        });
        
        it("the Person does not contain an english label", function () {
            expect(vocabulary["http://deichman.no/ontology#Person"]["en"]).not.toBeDefined();
        });
        
        it("the Person does not contain a norwegian label", function () {
            expect(vocabulary["http://deichman.no/ontology#Person"]["no"]).not.toBeDefined();
        });

        it("vocabulary contains a PersonEnglish with fully qualified uri", function () {
            expect(vocabulary["http://deichman.no/ontology#PersonEnglish"]).toBeDefined();
        });
        
        it("the Person contains a default label", function () {
            expect(vocabulary["http://deichman.no/ontology#PersonEnglish"]["default"]).toBeDefined();
        });
        
        it("the Person does contain an english label", function () {
            expect(vocabulary["http://deichman.no/ontology#PersonEnglish"]["en"]).toBeDefined();
        });
        
        it("the Person does not contain a norwegian label", function () {
            expect(vocabulary["http://deichman.no/ontology#PersonEnglish"]["no"]).not.toBeDefined();
        });
    });

    describe("and $ontology fails to load", function() {
        var vocabulary = null;

        beforeEach(function() {
            $vocabulary = $injector.get('$vocabulary');
            $httpBackend.expectGET('/config').respond(200, mocks.config);
            $httpBackend.expectGET(ontologyUri).respond(500, '');
            $vocabulary.ready.then(function(data) {
                vocabulary = data;
            }, function() {
                vocabulary = false;
            });
            $httpBackend.flush();

        });

        it("vocabulary is empty and error promise is run", function() {
            expect(vocabulary).toBe(false);
        });
    });
});
