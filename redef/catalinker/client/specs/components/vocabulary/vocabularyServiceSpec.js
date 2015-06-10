describe("catalinker.vocabulary", function () {
    'use strict';

    beforeEach(function () {
        module('catalinker.vocabulary');
    });

    describe("VocabularyService", function() {
        it("should have an endpoint configured", inject(function(ontologyUri) {
            expect(ontologyUri).toBe('http://192.168.50.12:8005/ontology');
        }));
    });
});
