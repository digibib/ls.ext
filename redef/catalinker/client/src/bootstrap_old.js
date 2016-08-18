debugger
require('es5-shim');
require('babel-polyfill');
var Main = require('./main_old');
Main.init().then(function () { Main.loadOntology() });
