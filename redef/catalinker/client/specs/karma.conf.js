// karma.conf.js
module.exports = function (config) {
    'use strict';
    config.set({
        browserNoActivityTimeout: 60000, //ms
        basePath: '../',
        frameworks: ['jasmine'],
        files: [
            'lib/angular.min.js',
            'lib/angular-animate.min.js',
            'lib/angular-aria.min.js',
            'lib/angular-route.min.js',
            'lib/*.js',
            'specs/lib/angular-mocks.js',
            'app/catalinkerApp.js',
            'app/services/*.js',
            'app/directives/*.js',
            'app/views/**/*.js',
            'specs/**/*Spec.js'
        ],
        exclude: ['app/directives/*.js'],
        
        // coverage reporter generates the coverage
        reporters: ['progress', 'coverage'],
        
        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'app/**/*.js': ['coverage']
        },
        
        browsers: ['PhantomJS'],
        
        // optionally, configure the reporter
        coverageReporter: {
            dir: 'specs/coverage/',
            reporters: [
                { type: 'html', subdir: '.'},
                { type: 'json', subdir: '.', file: 'coverage.json'}
                ]
        }
    });
};