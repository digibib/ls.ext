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

    function promiseSelection($q, configPromise, selectionFunction) {
        var deferred = $q.defer();
        selectionFunction = selectionFunction || function (data) {
                return data;
            };
        configPromise.then(function (data) {
            var selection = selectionFunction(data);
            if (selection) {
                deferred.resolve(selection);
            } else {
                deferred.reject("config data not found");
            }
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    angular.module('catalinker.config', [])
        .constant('configPath', '/config')
        .factory('config', ['$q', '$http', 'configPath', function ($q, $http, configPath) {
            return asNormalPromise(
                $q, $http.get(configPath, {headers: {accept: 'application/json'}})
            );
        }])
        .factory('resourceApiUri', ['$q', 'config', function ($q, config) {
            return promiseSelection($q, config, function (data) { return data.resourceApiUri; });
        }])
        .factory('ontologyUri', ['$q', 'config', function ($q, config) {
            return promiseSelection($q, config, function (data) { return data.ontologyUri; });
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