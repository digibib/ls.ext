(function() {
    function asNormalPromise($q, httpPromise, successCallback) {

        var deferred = $q.defer();
        successCallback = successCallback || function (data) {
                return data;
            };
        httpPromise
            .success(function (data) {
                deferred.resolve(successCallback(data));
            }).error(function (data, status, headers) {
                deferred.reject({status: status, headers: headers, data: data});
            });
        return deferred.promise;
    }

    angular.module('catalinker.config', [])
        .constant('configPath', '/config')
        .factory('ontologyUri', ['$q', '$http', 'configPath', function ($q, $http, configPath) {
            return asNormalPromise(
                $q, $http.get(configPath, {headers: {accept: 'application/json'}}),
                function (data) {
                    return data.ontologyUri;
                }
            );
        }])
        .factory('ontologyFactory', ['$q', '$http', 'ontologyUri', function ($q, $http, ontologyUri) {
            var ontologyDeferred = $q.defer();
            ontologyUri
                .then(function (uri) {
                    ontologyDeferred.resolve(asNormalPromise($q, $http.get(uri, {headers: {accept: 'application/ld+json'}})));
                }, function (error) {
                    ontologyDeferred.reject(error);
                });
            return ontologyDeferred.promise;
        }]);
}());