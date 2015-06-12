(function() {

    function asNormalPromise($q, httpPromise) {
        var deferred = $q.defer();
        httpPromise
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data, status, headers) {
                deferred.reject({status: status, headers: headers, data: data});
            });
        return deferred.promise;
    }

    angular.module('catalinker.vocabulary', [])
        .constant('ontologyUri', 'http://192.168.50.12:8005/ontology')
        .factory('ontologyFactory', ['$q', '$http', 'ontologyUri', function($q, $http, ontologyUri) {
            return asNormalPromise($q, $http.get(ontologyUri, {headers: {accept: 'application/ld+json'}}));
        }])
        .factory('vocabulary', ['$q', 'ontologyFactory', function($q, ontologyFactory) {
            var context,
                vocab,
                labelIndex = {},
                deferred;

            function replaceUriWithContext(uri) {
                var result = uri;
                angular.forEach(context, function(c) {
                    if (uri.indexOf(c) === 0) {
                        result = c;
                    }
                });
                return result;
            }

            function init(ontology) {
                context = ontology['@context'];
                vocab = ontology['@graph'];

                vocab.forEach(function (obj) {
                    var label = {
                            'default': obj['rdfs:label']
                        };
                    if (obj['rdfs:label'] instanceof Array) {
                        obj['rdfs:label'].forEach(function(l) {
                            label[l['@language']] = l['@value'];
                        });
                        label['default'] = label.no || label.en;
                    }
                    labelIndex[obj['@id']] = label;
                    labelIndex[replaceUriWithContext(obj['@id'])] = label;
                });
            }

            deferred = $q.defer();
            ontologyFactory
                .then(function(data) {
                    init(data);
                    deferred.resolve();
                },function() {
                    deferred.reject();
                });

            return {
                labels: labelIndex,
                vocabulary: vocab,
                promise: deferred.promise
            };
        }]);
}());