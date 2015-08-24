Catalinker
==========
Catalinker provides a browser-based cataloguing interface.

The catalinker has a client which runs in the browser, and a simple server which serves the static files needed in the client.
The client interacts with [Services](../services/README.md) layer.

## Server details

The server is a very basic HTTP server which servers the static resources (html, css, javascript) for the catalinker and exposes some variables in a /config endpoint.

(We are considering to extend the server with a proxy for the services endpoints, so that the catalinker only would communicate with localhost.)

### Technologies used

 * Ruby
 * Sinatra
 * webmock (test)

## Client details

The client gets some initial resource addresses from the /config endpoint of the server. It then fetches the ontology and adapts the user interface according to the type of resource.

Catalinker communicates with Services using HTTP POST and PATCH requests.

### Technologies used

 * JavaScript
 * [Ractive](http://www.ractivejs.org/)
 * [Require.js](http://requirejs.org/)
 * [UMD](https://github.com/umdjs/umd)
 * [Karma](http://karma-runner.github.io/) (test runner)
 * [Casper](http://casperjs.org/) (test - browser automation)
 * [Sinon](http://sinonjs.org/) (test - http mocking)

## Operations

See [Makefile](Makefile).

## Troubleshooting

Logs can be viewed via:
* [Core ls.ext log viewer](https://github.com/digibib/ls.ext#monitoring-of-logs-with-devops-the-logserver)
* Running `make log-f` in the Catalinker catalogue
