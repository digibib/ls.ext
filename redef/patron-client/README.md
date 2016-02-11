# Patron client

Patron client is the main interface for patrons to interact with the library on the internet, including searching and browsing the catalogue.

Patron-client is a browser-based application. It is consuming data from [Services](../services/README.md) and the search index.

## Technologies used

All modules are specified in package.json.

* [Node.JS](https://nodejs.org/)
* Server
  * [Gulp](http://gulpjs.com/) (temporarily, to be decided)
* Templating/Browser rendering
  * [React](http://facebook.github.io/react/)
  * [React-router](https://github.com/rackt/react-routerq)
  * [Redux](https://github.com/rackt/redux)
* Testing
  * [Mocha](https://mochajs.org/)
  * React-test-utils
  * [Jsdom](https://github.com/tmpvar/jsdom)
* Build
  * Gulp (watch, uglify, generate sourcemaps, browserify)

## Build

See [Makefile](Makefile).

## Troubleshooting

Logs can be viewed via:
* Running `make logs` in the `/vagrant/redef/patron-client` (when you have ssh'ed into dev-ship)
