(function() {

    angular.module('catalinker.vocabulary', ['catalinker.config'])
        .factory('vocabulary', ['$q', 'ontologyFactory', function($q, ontologyFactory) {
            var deferred;

            function replaceContextInUri(contextHash, uri) {
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
                return ontology['@context'] || {};
            }


            function get_graph(ontology) {
                return ontology['@graph'] || [];
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
                    result[replaceContextInUri(get_context(ontology), obj['@id'])] = label;
                });
                return result;
            }

            deferred = $q.defer();

            ontologyFactory
                .then(function(ontology) {
                    deferred.resolve(extract_labels(ontology));
                },function() {
                    deferred.reject();
                });

            return {
                replaceContextInUri: replaceContextInUri,
                labels: deferred.promise
            };
        }]);
}());