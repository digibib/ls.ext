(function(angular) {
    angular.module('catalinker', ['ngRoute', 'catalinker.vocabulary', 'catalinker.triplestore', 'catalinker.ontology', 'catalinker.languageCode'])
    .controller('AppController', ['$scope', '$vocabulary', function($scope, $vocabulary) {
            
        }])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.
            when('/work/:workId', {
                templateUrl: 'app/views/work/work.html',
                controller: 'WorkController'
            })
            .otherwise({
                templateUrl: 'app/views/work/work.html',
                controller: 'WorkController'
            });
        }]);
}(angular));