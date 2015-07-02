describe("Given catalinker.triplestore is loaded", function () {
    'use strict';
    var $httpBackend,
        $injector,
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
    
    beforeEach(function () {
        module('catalinker.config');
        module('catalinker.triplestore');
    });
    
    beforeEach(inject(function (_$injector_) {
        $injector = _$injector_;
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $window = $injector.get('$window');
        loadMocks();
    }));
    
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("and triple store is loaded successfully", function () {
        var $triplestore, isReady = false;
        beforeEach(function() {
            $triplestore = $injector.get('$tripleStore');
            $httpBackend.expectGET('/config').respond(200, mocks.config);
            $triplestore.ready.then(function (data) {
                isReady = true;
            });
            $httpBackend.flush();
        });
        it("it is ready", function() {
            expect(isReady).toBe(true);
        });

        describe("And we create a new work description successfully", function () {
            var isError = false;
            beforeEach(function () {
                $httpBackend.expectPOST('http://192.168.50.12:8005/Work').respond(200, '',{Location:'http://192.168.50.12:8005/work/w222557057913'});
                $httpBackend.expectGET('http://192.168.50.12:8005/work/w222557057913').respond(200, mocks.work_new);
                $triplestore.newDescription('Work').then(function() {

                }, function() {
                    isError = true;
                });
                $httpBackend.flush();
            });
            it("it failed", function () {
                expect(isError).toBe(false);
            });
        });

        describe("And we create a new work description unsuccessfully", function () {
            var isError = false;
            beforeEach(function () {
                $httpBackend.expectPOST('http://192.168.50.12:8005/Work').respond(500, '', { Location: 'http://192.168.50.12:8005/work/w222557057913' });
                //$httpBackend.expectGET('http://192.168.50.12:8005/work/w222557057913').respond(200, mocks.work_new);
                $triplestore.newDescription('Work').then(function () {

                }, function () {
                    isError = true;
                });
                $httpBackend.flush();
            });
            it("it failed", function () {
                expect(isError).toBe(true);
            });
        });

    });
    
    describe("and config failed to load", function () {
        var $triplestore, isReady = false, isError = false;
        beforeEach(function () {
            $triplestore = $injector.get('$tripleStore');
            $httpBackend.expectGET('/config').respond(500, '');
            $triplestore.ready.then(function (data) {
                isReady = true;
            }, function() {
                isError = true;
            });
            $httpBackend.flush();
        });
        it("it is not ready", function () {
            expect(isReady).toBe(false);
        });
        it("it failed", function () {
            expect(isError).toBe(true);
        });
    });    

    xdescribe("getDescription", function() {
        var $rootScope,
            $httpBackend,
            work_w222557057913_Uri = 'http://192.168.50.12:8005/work/w222557057913',
            promise,
            tripleStore;

        beforeEach(function () {
            module(function ($provide) {
                $provide.factory('config', function ($q) {
                    var dfd = $q.defer();
                    dfd.resolve({ resourceApiUri: 'http://192.168.50.12:8005/' });
                    return dfd.promise;
                });
            });
        });

        beforeEach(function () {
            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
            });
        });

        it("should return the triples describing a resource", function(done) {
            $httpBackend.expectGET(work_w222557057913_Uri).respond(200,
                // TODO avoid duplication and fetch this from the file: mocks/work_w222557057913.json
                JSON.stringify(
                    {
                        "@id": "http://deichman.no/work/w222557057913",
                        "@type": "http://data.deichman.no/lsext-model#Work",
                        "lsext:biblio": "2",
                        "lsext:date": "2015",
                        "lsext:creator": "http:example.com/person/p1",
                        "lsext:name": [
                            "Title",
                            {
                                "@value": "Saker",
                                "@lang": "nb"
                            }
                        ],
                        "@context": {
                            "lsext": "http://data.deichman.no/lsext-model#"
                        }
                    }));
  
            inject(function (_tripleStore_) {
                tripleStore = _tripleStore_;
            });

            promise = tripleStore.getDescription("work", "w222557057913");
            promise.then(function(desc) {
                expect(desc.graph["@id"]).toBe("http://deichman.no/work/w222557057913");
                expect(desc.triples.length).toBe(5);
                done();
            });

            $rootScope.$digest();
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });        

    });

    describe("newDescription", function() {
        var $httpBackend;
        // TODO
    });
});



