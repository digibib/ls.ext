# Patron client

Patron client is a browser-based viewer (for now) for data from [Services](../services/README.md).

## Technologies used

All modules are specified in package.json.

* [Node.JS](https://nodejs.org/)
* Server
  * [Express](http://expressjs.com/)
* Templating/Browser rendering
  * [Ractive.js](http://www.ractivejs.org/)
  * [UMD](https://github.com/umdjs/umd)
* Testing
  * [Chai](http://chaijs.com/)
  * [Mocha](https://mochajs.org/)
  * [Jsdom](https://github.com/tmpvar/jsdom)
* Build
  * Gulp (watch, uglify, generate sourcemaps, browserify)

## Build

See [Makefile](Makefile).

## Troubleshooting

Logs can be viewed via:
* [Core ls.ext log viewer](https://github.com/digibib/ls.ext#monitoring-of-logs-with-devops-the-logserver)
* Running `make log-f` in the Patron client catalogue
