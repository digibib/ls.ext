(function(angular) {
    angular.module('catalinker', ['ngMaterial', 'ngRoute', 'catalinker.vocabulary', 'catalinker.triplestore'])

    .controller('appController', ['$scope', '$mdSidenav', 'vocabulary', 'tripleStore', function ($scope, $mdSidenav, vocabulary, tripleStore) {
        var Triple = tripleStore.Triple,
            description = null;
        
        
        $scope.labels = {};
        $scope.triples = [];
        $scope.titles = {};
        $scope.fields = [];
        $scope.selectedField = '';

        
        function init() {
            
            tripleStore.getDescription('work', 'w222557057913').then(function (_description) {
                $scope.triples = _description.triples;
                description = _description;
            }, function (err) {
                console.log('loading hardcoded work failed', err);
            });
            
            vocabulary.labels.then(function(labels) {
                $scope.labels = labels;
                angular.forEach(labels, function (label, key) {
                    $scope.fields.push({ predicate: key, label: label });
                });
            });
        }
        
        $scope.add = function () {
            $scope.triples.push(new Triple({ subject: description.subject, predicate: $scope.selectedField.predicate, value: "" }));
        };
        
        $scope.removeTriple = function (t) {
            description.removeTriple(t);
        };
        
        $scope.newWork = function () {
            description = null;
            $scope.triples = [];
            tripleStore.newDescription('work').then(function (desc) {
                description = desc;
                $scope.triples = desc.triples;
            }, function () {
            });
        };
        
        init();
    }])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.
            when('/:@type/:@id', {

            });
        }])
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
    }]);
}(angular));

