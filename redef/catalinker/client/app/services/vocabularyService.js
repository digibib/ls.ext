(function() {

    angular.module('catalinker.vocabulary', ['catalinker.config'])
        .factory('$vocabulary', [
            '$q', '$ontology', function($q, $ontology) {
                var deferred = $q.defer();

                function replaceContextInUri(contextHash, uri) {
                    var result = null, prefix;
                    angular.forEach(contextHash, function(value, key) {
                        if (!result) {
                            prefix = new RegExp('^' + key + ":");
                            if (prefix.test(uri)) {
                                result = uri.replace(prefix, value);
                            }
                        }
                    });
                    return result || uri;
                }

                function getContext(ontology) {
                    return ontology['@context'] || {};
                }

                function getGraph(ontology) {
                    return ontology['@graph'] || [];
                }

                function extractLabels(ontology) {
                    var result = {};
                    getGraph(ontology).forEach(function(obj) {
                        var label = {
                            'default': obj['rdfs:label']
                        };
                        if (obj['rdfs:label'] instanceof Array) {
                            obj['rdfs:label'].forEach(function(l) {
                                label[l['@language']] = l['@value'];
                            });
                            label['default'] = label.no || label.en;
                        }
                        result[replaceContextInUri(getContext(ontology), obj['@id'])] = label;
                    });
                    return result;
                }

                $ontology.ready
                    .then(function(ontology) {
                        deferred.resolve(extractLabels(ontology));
                    }, function() {
                        deferred.reject();
                    });

                return {
                    ready: deferred.promise
                };
        }]);
}());