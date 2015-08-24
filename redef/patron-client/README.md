# Patron client

Patron client is a browser-based viewer (for now) for data from [Services](../services/README.md).

## Technologies used

* [Node.JS](https://nodejs.org/)
* Server
  * [http](https://nodejs.org/api/http.html)
  * [Express](http://expressjs.com/)
* Templating
  * [Handlebars](http://handlebarsjs.com/)
* Testing
  * [Chai](http://chaijs.com/)
  * [Cheerio](https://github.com/cheeriojs/cheerio)
  * [Router](https://github.com/tildeio/router.js/)

## Build

See [Makefile](Makefile).

## Troubleshooting

Logs can be viewed via:
* [Core ls.ext log viewer](https://github.com/digibib/ls.ext#monitoring-of-logs-with-devops-the-logserver)
* Running `make log-f` in the Patron client catalogue
