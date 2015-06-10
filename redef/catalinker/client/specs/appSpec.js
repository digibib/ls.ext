describe("Given user is logged in", function () {
    'use strict';
    var $httpBackend,
        $rootScope,
        $scope,
        $route,
        $location,
        $window,
        $controller,
        controller,
        ontologyUri = 'http://192.168.50.12:8005/ontology',
        mocks = {},
        work_w222557057913_Uri = 'http://192.168.50.12:8005/work/w222557057913',
        newWorkUri = 'http://192.168.50.12:8005/work';

    function createController(name, parentScope) {
        var scope = (parentScope || $rootScope).$new(),
            ctrl = $controller(name, { $scope: scope });
        ctrl.$scope = scope;
        return ctrl;
    }
    
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

    beforeEach(module('catalinker'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $location = $injector.get('$location');
        $route = $injector.get('$route');
        $window = $injector.get('$window');
        //$location.path('/');
        $controller = $injector.get('$controller');
        $window = $injector.get('$window');
        loadMocks();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

   describe("And the page is finished initialized", function () {
        beforeEach(function () {
            $httpBackend.expectGET(ontologyUri).respond(200, mocks.ontology);
            $httpBackend.expectGET(work_w222557057913_Uri).respond(200, mocks.work_w222557057913);
            controller = createController('appController');
            $scope = controller.$scope;
            $httpBackend.flush();
        });
        it("The url should be /", function () {
            //expect(true).toBe(true);
            expect($location.url()).toBe('');
        });
        it("The list of triples should contain 5 items", function() {
            expect($scope.triples.length).toBe(5);
        });

        it("The first triple should have value '2'", function() {
            expect($scope.triples[0].value).toBe('2');
        });

        it("The list of predicates should contain 8 items", function() {
            expect($scope.predicates.length).toBe(8);
        });        

        describe("And the user changes the date", function() {
            var triple;            
            beforeEach(function() {
                triple = $scope.triples[1];
                triple.value = '2012';
            });

            it("The triple savedValue is still 2015", function(){
                expect(triple.savedValue).toBe('2015');
            });

            describe("And focus out triggers save (success)", function() {
                var needsFlush = true,
                    promise,
                    resolved = false;
                beforeEach(function() {
                    $httpBackend.expectPATCH(work_w222557057913_Uri).respond(200, '');
                    promise = triple.save();
                    promise.then(function() {
                        resolved = true;
                    });
                });

                afterEach(function() {
                    if (needsFlush) $httpBackend.flush();
                });

                it("The promise is not resolved", function(){
                    expect(resolved).toBe(false);
                });

                it("The triple isSaving is true", function(){
                    expect(triple.isSaving).toBe(true);
                });

                describe("And save returns from server", function() {
                    beforeEach(function(){
                        $httpBackend.flush();
                        needsFlush = false;
                    });

                    it("The promise is resolved", function() {
                        expect(resolved).toBe(true);
                    });

                    it("The triple isSaving is false", function() {
                        expect(triple.isSaving).toBe(false);
                    });

                    it("The triple savedValue is 2012", function() {
                        expect(triple.savedValue).toBe('2012');
                    });

                    //This test crashes the testrunner on second round for some reason
                    xdescribe("And save is triggered without value being changed", function() {
                        beforeEach(function() {
                            resolved = false;
                            promise = triple.save();
                            promise.then(function() {
                                resolved = true;
                            });
                            $scope.$apply();
                        });

                        it("The save promise was resolved without http", function() {
                            expect(resolved).toBe(true);
                        });

                    });

                });
            });

        }); 

        describe("And we want to add a triple by first selecting a predicate", function() {
            beforeEach(function() {
                $scope.predicate = $scope.predicates[0].value;
            });
            
            it("The selected predicate should be 'http://deichman.no/ontology#Work'", function() {
                expect($scope.predicate).toBe('http://deichman.no/ontology#Work');
            });

            describe("And the user clicks the add button", function() {
                var newItem;

                beforeEach(function() {
                    $scope.add();
                    newItem = $scope.triples[$scope.triples.length -1];
                });
                

                it("The selected predicate should still be 'http://deichman.no/ontology#Work'", function() {
                    expect($scope.predicate).toBe('http://deichman.no/ontology#Work');
                });

                it("The list of triples should contain 6 items", function() {
                    expect($scope.triples.length).toBe(6);
                });

                it("The new items predicate should be 'http://deichman.no/ontology#Work'", function() {
                    expect(newItem.predicate).toBe('http://deichman.no/ontology#Work');
                });
                
                it("The new item should have empty value", function() {
                    expect(newItem.value).toBe('');
                });
                
                it("The new item should have status isNew", function() {
                    expect(newItem.isNew).toBe(true);
                });

                describe("And the user focus out the server will save", function() {
                    beforeEach(function() {
                        $httpBackend.expectPATCH(work_w222557057913_Uri).respond(200, '');
                        newItem.save();
                        $httpBackend.flush();
                    });

                    it("The new item has not anylonger isNew status", function() {
                        expect(newItem.isNew).toBe(false);
                    });
                });
            });        
        });

        describe("And the user clicks 'remove' on the first triple (success)", function() {
            var tripleToRemove,
                needsFlush = true;
            beforeEach(function() {
                tripleToRemove = $scope.triples[0];
                $httpBackend.expectPATCH(work_w222557057913_Uri).respond(200, '');
                $scope.removeTriple(tripleToRemove);
                //$httpBackend.flush();
            });

            afterEach(function() {
                if (needsFlush) $httpBackend.flush();
            });
            
            it("The list of triples should still contain 5 items", function() {
                expect($scope.triples.length).toBe(5);
            });

            it("The triple to remove gets status isSaving", function(){
                expect(tripleToRemove.isSaving).toBe(true);
            });

            describe("And the server returns successfully", function() {
                beforeEach(function() {
                    needsFlush = false;
                    $httpBackend.flush();
                });
                
                it("The list of triples should contain 4 items", function(){
                    expect($scope.triples.length).toBe(4);
                });

                it("The triple to remove is not in the list", function(){
                    expect($scope.triples.indexOf(tripleToRemove)).toBe(-1);
                });                

            });
        });

        describe("And the user clicks 'remove' on the first triple (fail)", function() {
            var tripleToRemove,
                needsFlush = true;            
            beforeEach(function() {
                tripleToRemove = $scope.triples[0];
                $httpBackend.expectPATCH(work_w222557057913_Uri).respond(400, '');
                $scope.removeTriple(tripleToRemove);
                //$httpBackend.flush();
            });

            afterEach(function() {
                if (needsFlush) $httpBackend.flush();
            });            
            
            it("The list of triples should contain 5 items", function() {
                expect($scope.triples.length).toBe(5);
            });

            it("The triple to remove gets status isSaving", function(){
                expect(tripleToRemove.isSaving).toBe(true);
            });

            describe("And the server returns 400 error", function() {
                beforeEach(function() {
                    needsFlush = false;
                    //$httpBackend.expectPATCH(work_w222557057913_Uri).respond(200, '');
                    //$scope.removeTriple($scope.triples[0]);
                    $httpBackend.flush();
                });
                
                it("The list of triples should still contain 5 items", function(){
                    expect($scope.triples.length).toBe(5);
                });

                it("The triple to remove has not anymore isSaving", function(){
                    expect(tripleToRemove.isSaving).toBe(false);
                });
            });
        });

        describe("And the user clicks 'New Work' (success)", function() {
            beforeEach(function() {
                $httpBackend.expectPOST(newWorkUri).respond(201,'', {'Location': work_w222557057913_Uri});
                $httpBackend.expectGET(work_w222557057913_Uri).respond(200, mocks.work_w222557057913);
                $scope.newWork();
                $httpBackend.flush();
            });

            it("The triples list should be 5 triples", function() {
                expect($scope.triples.length).toBe(5);
            });
        });

    });

});