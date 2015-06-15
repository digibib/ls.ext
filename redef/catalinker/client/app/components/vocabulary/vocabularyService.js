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
            var deferred;

            function replaceUriWithContext(contextHash, uri) {
                var result = null, prefix;
                angular.forEach(contextHash, function (value, key) {
                    if (!result) {
                        prefix = new RegExp('^' + key + ":");
                        if (prefix.test(uri)) {
                            result = uri.replace(prefix, value);
                        }
                    }
                });
                return result || uri;
            }

            function get_context(ontology) {
                return ontology['@context'];
            }


            function get_graph(ontology) {
                return ontology['@graph'];
            }

            function extract_labels(ontology) {
                var result = {};
                get_graph(ontology).forEach(function (obj) {
                    var label = {
                        'default': obj['rdfs:label']
                    };
                    if (obj['rdfs:label'] instanceof Array) {
                        obj['rdfs:label'].forEach(function (l) {
                            label[l['@language']] = l['@value'];
                        });
                        label['default'] = label.no || label.en;
                    }
                    result[replaceUriWithContext(get_context(ontology), obj['@id'])] = label;
                });
                return result;
            }

            deferred = $q.defer();

            ontologyFactory
                .then(function(ontology) {
                    deferred.resolve(
                        {
                            labels: extract_labels(ontology)
                        }
                    );
                },function() {
                    deferred.reject();
                });

            return deferred.promise;
        }]);
}());