# Patron client

Patron client is a browser-based viewer (for now) for data from [Services](../services/README.md).

## Technologies used

* [Node.JS](https://nodejs.org/)
* Server
  * [http](https://nodejs.org/api/http.html)
  * [Express](http://expressjs.com/)
* Templating/Browser rendering
  * [Handlebars](http://handlebarsjs.com/) Deprecated: will use ractivejs + Mustache in future
  * [Ractive.js](http://www.ractivejs.org/)
  * [UMD](https://github.com/umdjs/umd)
* Testing
  * [Cheerio](https://github.com/cheeriojs/cheerio) Deprecated: will use mocha + jsdom in future
  * [Router](https://github.com/tildeio/router.js/) Deprecated: will use mocha + jsdom in future
  * [Chai](http://chaijs.com/)
  * [Mocha](https://mochajs.org/)
  * [Jsdom](https://github.com/tmpvar/jsdom)

## Build

See [Makefile](Makefile).

## Troubleshooting

Logs can be viewed via:
* [Core ls.ext log viewer](https://github.com/digibib/ls.ext#monitoring-of-logs-with-devops-the-logserver)
* Running `make log-f` in the Patron client catalogue
