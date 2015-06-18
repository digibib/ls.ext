(function() {
    "use strict";

    // Leave this for reference
    //
    // var work = {
    //     "@id": "http://deichman.no/work/work_1231",
    //     "@type": "http://data.deichman.no/lsext-model#Work",
    //     "lsext:biblio": "2",
    //     "lsext:date": "2015",
    //     "lsext:creator": "http:example.com/person/p1",
    //     "lsext:name": ["Title",
    //                {
    //             "@value": "Saker",
    //             "@lang": "nb"
    //         }],
    //     "@context": {
    //         "lsext": "http://data.deichman.no/lsext-model#"
    //     }
    // };


    function Description(graph, subject) {
        this.graph = graph; // store old
        this.subject = subject || '';
        this.context = graph && graph['@context'] ? graph['@context'] : {};
        this.triples = [];
        if(graph) {
            this.triples = this.graphToTriples(graph, subject);
        }
    }

    Description.prototype.resolveContext = function(val) {
        var colon = val.indexOf(':'), cstring;
        if (colon > 0) {
            cstring = val.substr(0, colon);
            return this.context[cstring] + val.substr(colon + 1);
        }
        return val;
    };

    Description.prototype.graphToTriples = function(graph) {
        var triples = [],
            description = this;
        angular.forEach(graph, function (value, key) {
            if (key.indexOf('@') !== 0) {
                if (value instanceof Array) {
                    value.forEach(function (val) {
                        triples.push(new Triple(
                            {
                                subject: description.subject,
                                predicate: description.resolveContext(key),
                                value: val
                            }));
                    });
                } else {
                    triples.push(new Triple({ subject: description.subject, predicate: description.resolveContext(key), value: value }));
                }
           
            }
        });
        return triples;
    };

    Description.prototype.removeTriple = function (t) {
        var triples = this.triples,
            promise = t.remove();

        promise.then(function() {
            var index = triples.indexOf(t);
            if(index >= 0) {
                triples.splice(index, 1);
            }
        }, 
        function() {

        });
        return promise;
    };


    function Triple(t) {
        var value = t.value;
        this.lang = '';
        if (value instanceof Object && value.hasOwnProperty('@value')) {
            this.lang = value['@lang'] || '';
            value = value['@value'];
            this.tags = value;
        }
        this.subject = t.subject || '';
        this.type = t.type || t.predicate;
        this.predicate = t.predicate;
        this.value = value;
        this.savedValue = value;
        
        this.id = "";//todo:generate unique id that can be used as a reference in gui
        
        //status flags
        this.isValid = true;
        this.isSaving = false;
        this.isLoading = false;
        this.isNew = value ? false: true;
        this.isReadOnly = false;
    }

    Triple.prototype.validate = function() {
        this.isValid = true;
    };

    var Patch = {
        add : function(triple) {
            return {op: 'add', s: triple.subject, p: triple.predicate, o: triple.value};//todo: handle complex objects as o
        },
        remove : function(triple) {
            return {op: 'del', s: triple.subject, p: triple.predicate, o: triple.savedValue}; //todo: handle complex objects as o
        },
        modify : function(triple) {
            return [
                Patch.remove(triple),
                Patch.add(triple)
            ];
        }    
    };


    angular.module('catalinker.triplestore', ['catalinker.config'])
    .factory('tripleStore', ['$http', '$q', '$timeout', 'resourceApiUri', function ($http, $q,  $timeout, baseUri) {
        
        Triple.prototype.save = function () {
            var self = this,
                deferred = $q.defer(),
                patch,
                isNew = this.isNew;
            if (this.value === this.savedValue && !this.isNew) { //value is not changed
                deferred.resolve();
                return deferred.promise;
            }
            this.validate();
            if (!this.isValid) {
                deferred.reject();
                return deferred.promise;   
            }
            this.isSaving = true;
            //this.isNew = false; //todo: if save fails, set isNew back to what it was
            //console.log('saving...', this.predicate, this.value);
            patch = this.isNew ? Patch.add(this) : Patch.modify(this);

            $http.patch(this.subject, patch).success(function() {
                self.isSaving = false;
                self.isNew = false;
                self.savedValue = self.value;
                deferred.resolve();
            }).error(function() {
                self.isSaving = false;
                self.isNew = isNew;
                deferred.reject();
            });
    /*
            $timeout(function() {//fake server async
                self.isSaving = false;
                self.savedValue = self.value;

                deferred.resolve();
            }, 1000);
    */
            return deferred.promise;
        };
        
        Triple.prototype.remove = function() {
            var self = this,
                deferred = $q.defer();
            if (self.isNew) {
                deferred.resolve();
                return deferred.promise;
            }        

            self.isSaving = true;

            $http.patch(this.subject, [Patch.remove(this)]).success(function() {
                self.isSaving = false;
                self.isNew = true;
                deferred.resolve();
            }).error(function(){
                self.isSaving = false;
                self.isNew = false;
                deferred.reject();
            });

    /*
            $timeout(function () {//fake server async
                self.isSaving = false;
                self.isNew = true;
                deferred.resolve();
            }, 1000);
    */
            return deferred.promise;
        };


        function getDescription(itemType, id) {
            var deferred = $q.defer();

            baseUri.then(function (baseUri) {
                var uri = baseUri + itemType + '/' + id;
                $http.get(uri).success(function(data, status, headers, config){
                    var description = new Description(data, uri);
                    deferred.resolve(description);
                }).error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function newDescription(descriptionType) {
            var deferred = $q.defer(),
                baseId = 'http://deichman.no/',
                newObject;

            newObject = {
                '@id': 'http://example.com/work1', //must be a valid url. To be deprecated
                '@type': 'http://deichman.no/ontology#' + descriptionType //Implicit in uri, To be deprecated
            };

            baseUri.then(function (baseUri) {
                var uri = baseUri + descriptionType;
                $http.post(uri, newObject).success(function(data, status, headers) { //, config
                    var itemUri = headers('Location').replace(baseId, baseUri);
                    $http.get(itemUri).success(function(itemData) { //, status, headers, config
                        var description = new Description(itemData, itemUri);
                        deferred.resolve(description);
                    }).error(function(errorData, errorStatus) { //,headers, config
                        deferred.reject(errorStatus);
                    });
                }).error(function(data, status) { //, headers, config
                    deferred.reject(status);
                });
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        return {
            Triple: Triple,
            getDescription: getDescription,
            newDescription: newDescription
        };
    }]);


}());