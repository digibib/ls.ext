(function(angular) {

    angular.module('catalinker.ontology', ['catalinker.config'])
        .factory('$ontology', ['$q','$http', '$config', function($q, $http, $config) {
            var ontologyDeferred = $q.defer();
            $config.ready
                .then(function (cfg) {
                    $http.get(cfg.ontologyUri, { headers: { accept: 'application/ld+json' } }).success(function(data) {
                        ontologyDeferred.resolve(data);
                    }).error(function(data, status, headers) {
                        ontologyDeferred.reject({ status: status, headers: headers, data: data });
                    });
                
            }, function (error) {
                ontologyDeferred.reject(error);
            });
            return {
                ready: ontologyDeferred.promise
            };
        }]);
}(angular));