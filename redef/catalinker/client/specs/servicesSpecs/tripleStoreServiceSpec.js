xdescribe("catalinker.triplestore", function () {
    'use strict';

    beforeEach(function () {
        module('catalinker.triplestore');
    });


    describe("Triple", function() {
        // TODO
    });

    describe("getDescription", function() {
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



