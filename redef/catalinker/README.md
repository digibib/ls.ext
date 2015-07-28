Catalinker
==========
Catalinker provides an HTML cataloguing interface that interacts with [Services](../services/README.md).

## Server

The server is a very basic HTTP server which servers the static resources (html, css, javascript) for the catalinker and exposes some variables in a /config endpoint.

We are considering to extend the server with a proxy for the services endpoints, so that the catalinker only would commuicate with localhost.

### Technologies used

 * Ruby
 * Sinatra
 * webmock (test)

## Client

The client gets some inital resource adresses the /config endpoint, so that it knows who to communicate with. It then fetches the ontology and adapts the user interface according to the type of resource.

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

* TODO: more logging
