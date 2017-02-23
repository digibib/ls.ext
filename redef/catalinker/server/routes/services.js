const requestProxy = require('express-http-proxy')
const url = require('url')
const apicache = require('apicache')
const cache = apicache.options({ debug: true }).middleware
const services = (process.env.SERVICES_PORT || 'http://services:8005').replace(/^tcp:\//, 'http:/')
const URI = require('urijs')

module.exports = (app) => {
  app.use('/search', cache('2 minutes', cacheableRequestsFilter), requestProxy(services, {
    forwardPath: (req, res) => {
      return '/search' + url.parse(req.url).pathname
    },
    decorateRequest: (proxyReq, req) => {
      proxyReq.headers['Content-Type'] = 'application/json'
      proxyReq.headers['Accept'] = 'application/json'
      return proxyReq
    }
  }))

  app.use('/services', cache('1 hour', cacheableRequestsFilter), requestProxy(services, {
    forwardPath: (req, res) => {
      return url.parse(req.url).path
    },
    intercept: (rsp, data, req, res, callback) => {
      if (['PUT', 'PATCH', 'DELETE'].indexOf(rsp.req.method) !== -1) {
        apicache.clear(req.originalUrl)
        apicache.clear(req.originalUrl + '/references')
        apicache.clear(req.originalUrl + '/relations')
        console.log(`clearing ${req.originalUrl}`)
      }
      callback(null, data)
    },
    decorateRequest: (proxyReq, req) => {
      if (req.method === 'GET' && URI.parseQuery(URI.parse(req.originalUrl).query).format === 'TURTLE') {
        proxyReq.headers['Accept'] = 'text/turtle'
      }
      return proxyReq
    }
  }))

  app.get('/valueSuggestions/:source/:type/:id', cache('1 hour'), requestProxy(services, {
    forwardPath: (req, res) => {
      const reqUrl = services + '/datasource/' + req.params.source + '/' + req.params.type + '/' + req.params.id.replace(/-/g, '')
      console.log(reqUrl)
      return url.parse(reqUrl).path
    }
  }))

  function cacheableRequestsFilter (req, res) {
    return (req.method === 'GET' || req.method === 'HEAD') &&
      !/^\/search\/.*$/.test(req.url) &&
      !/^.*\/relations$/.test(req.url) &&
      !/^.*\/inverseRelationsBy\/.*$/.test(req.url) &&
      !(URI.parseQuery(URI.parse(req.url).query).format === 'TURTLE')
  }
}
