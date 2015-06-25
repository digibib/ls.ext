(function(angular) {
    angular.module('catalinker', ['ngMaterial', 'ngRoute', 'catalinker.vocabulary', 'catalinker.triplestore'])
    .controller('AppController', ['$scope', 'vocabulary', function($scope, vocabulary) {
            
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
        }])
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
    }]);
}(angular));

