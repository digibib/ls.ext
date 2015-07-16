var cp = require('child_process');
var express = require('express');

// Serve application (html, js - static files)
// TODO serve /config endpoint and mock services endpoint
var app = express();
app.use(express.static('./../app'));
var server = app.listen(7777);

// Launches the CasperJS test suite in a subprocess
var ps = cp.spawn('casperjs', ['test', 'test/module-test/tests.js']);
ps.stdout.on('data', function (data) {
  console.log(data.toString().replace("\n", ""));
});
ps.stderr.on('data', function (data) {
  console.log(data.toString().replace("\n", ""));
});
ps.on('error', function (err) {
  console.log("failed to launch casperjs: " + err);
});
ps.on('exit', function () {
  if (process.argv.indexOf('--keepserver') === -1) {
    server.close();
  }
});
