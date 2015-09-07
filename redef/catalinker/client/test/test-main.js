var tests = [];
for (var file in window.__karma__.files) {
  if (/Spec\.js$/.test(file)) {
    tests.push(file);
  }
}

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base',

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // paths: maps ids with paths (no extension)
  paths: {
    'ractive.min': './lib/ractive.min',
    http: './src/http',
    graph: './src/graph',
    main: './src/main',
    ontology: './src/ontology',
    string: './src/string'
  },

  // shim: makes external libraries compatible with requirejs (AMD)
  shim: {
    'ractive.min': {
      exports: 'ractive'
    }
  },
  generateSourceMaps: true,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
