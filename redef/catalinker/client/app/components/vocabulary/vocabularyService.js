(function() {

    angular.module('catalinker.vocabulary', [])
        .constant('ontologyUri', 'http://192.168.50.12:8005/ontology')
        .factory('ontologyJson', ['$http', 'ontologyUri', function($http, ontologyUri) {
            return $http.get(ontologyUri, { headers: { accept: 'application/ld+json' } });
        }])
        .factory('$vocabulary', ['$q', 'ontologyJson', function($q, ontologyJson) {
        var context,
            reverseContext = {},
            vocab,
            labelIndex = {},
            deferred = $q.defer();
        
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
            deferred.resolve();
        }
    /*
        function getLabel(predicate) {
            return labelIndex[predicate] || predicate;
        }
    */
        ontologyJson
        .success(function(data) {
            init(data);
        }).error(function() {
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