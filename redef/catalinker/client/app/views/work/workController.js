(function (angular) {
    angular.module('catalinker')
        .controller('WorkController', [
        '$scope', '$vocabulary', '$tripleStore', '$routeParams', '$languageCode', function ($scope, $vocabulary, $tripleStore, $routeParams, $languageCode) {
            var Triple = $tripleStore.Triple,
                description = null;
            $scope.languageCodes = $languageCode;
            $scope.id = "<no id>";
            $scope.labels = {};
            $scope.triples = [];
            $scope.titles = {};
            $scope.fields = [];
            $scope.selectedField = '';
            
            function loadWork(workId) {
                $tripleStore.getDescription('work', workId).then(function (_description) {
                    $scope.triples = _description.triples;
                    description = _description;
                }, function (err) {
                    console.log('loading hardcoded work failed', err);
                });
            }
            
            function init() {
                // console.log($routeParams);
                // Todo: load on route change
                
                //todo: update tests and make this code run based on route
                $routeParams.workId && loadWork($routeParams.workId);
                
                $vocabulary.ready.then(function (labels) {
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
                $tripleStore.newDescription('work').then(function (desc) {
                    description = desc;
                    $scope.triples = desc.triples;
                    $scope.id = desc.subject;
                }, function () {
                });
            };
            
            init();
        }
    ]);
}(window.angular));