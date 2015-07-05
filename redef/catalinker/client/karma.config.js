module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['mocha','chai'],
    files: ['app/test/*.js','app/app/lib.js'],
    port: 9876,
    runnerPort: 9100,
    colors: true,
    exclude: [],
    autoWatch: true,
    browsers: ['PhantomJS'],
    captureTimeout: 5000,
    singleRun: false,
    reportSlowerThan: 500
  });
}; 
