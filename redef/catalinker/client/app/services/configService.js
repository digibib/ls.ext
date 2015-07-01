(function() {
    angular.module('catalinker.config', [])
        .constant('configPath', '/config')
        .factory('$config', [
        '$q', '$http', 'configPath', function ($q, $http, configPath) {
            var ontologyDeferred = $q.defer();
            $http.get(configPath, { headers: { accept: 'application/json' } })
                .success(function (data) {
                ontologyDeferred.resolve(data);
                }).error(function (data, status, headers) {
                ontologyDeferred.reject({ status: status, headers: headers, data: data });
            });
            return {
                ready: ontologyDeferred.promise
            };
        }
    ]);
}());