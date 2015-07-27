module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],
    files: [
        {pattern: 'lib/**/*.js', included: false},
        {pattern: 'src/**/*.js', included: false},
        {pattern: 'test/**/*Spec.js', included: false},
        'test/test-main.js'
    ],
    exclude: ['src/app.js'],
    port: 9876,
    runnerPort: 9100,
    colors: true,
    autoWatch: true,
    browsers: ['PhantomJS'],
    captureTimeout: 5000,
    singleRun: false,
    reportSlowerThan: 500
  });
};
