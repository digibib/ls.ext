(function() {

    angular.module('catalinker.vocabulary', [])
        .constant('ontologyUri', 'http://192.168.50.12:8005/ontology')
        .factory('ontologyFactory', ['$q', '$http', 'ontologyUri', function($q, $http, ontologyUri) {
            var httpPromise,
                deferred;

            // convert httpPromise to normal promise
            deferred = $q.defer();
            httpPromise = $http.get(ontologyUri, { headers: { accept: 'application/ld+json' } });
            httpPromise
                .success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    deferred.reject({status: status, headers: headers, data: data});
                });
            return deferred.promise;
        }])
        .factory('vocabulary', ['$q', 'ontologyFactory', function($q, ontologyFactory) {
            var context,
                reverseContext = {},
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

                angular.forEach(context, function(value, key) {
                    reverseContext[value] = key;
                });

                vocab.forEach(function (obj) {
                    var label = {
                            'default': obj['rdfs:label']
                        },
                        comment = {
                            'default': obj['rdfs:comment']
                       };
                    if (obj['rdfs:label'] instanceof Array) {
                        obj['rdfs:label'].forEach(function(l) {
                            label[l['@language']] = l['@value'];
                        });
                        label['default'] = label.no || label.en;
                    }
                    if (obj['rdfs:comment'] instanceof Array) {
                        obj['rdfs:comment'].forEach(function (c) {
                            comment[c['@language']] = c['@value'];
                        });
                        comment['default'] = comment.no || comment.en;
                    }
                    //obj['@label']
                    labelIndex[obj['@id']] = label;
                    labelIndex[replaceUriWithContext(obj['@id'])] = label;
                });
            }
        /*
            function getLabel(predicate) {
                return labelIndex[predicate] || predicate;
            }
        */
            deferred = $q.defer();
            ontologyFactory
                .then(function(data) {
                    init(data);
                    deferred.resolve();
                },function() {
                    deferred.reject();
                });

            return {
                //getLabel: getLabel,
                labels: labelIndex,
                vocabulary: vocab,
                promise: deferred.promise
            };
        }]);
}());