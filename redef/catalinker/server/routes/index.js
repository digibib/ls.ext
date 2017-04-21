var babelify = require('express-babelify-middleware')
var path = require('path')

module.exports = (app) => {
  require('./resource')(app)
  require('./services')(app)

  app.get('/', (req, res) => {
    var base = '/cataloguing'
    if (req.query.language) {
      base += `?language=${req.query.language}`
    }
    res.redirect(base)
  })

  app.get('/cataloguing_old/*', (req, res, next) => {
    res.sendFile('main_old.html', { title: 'Katalogisering', root: path.join(__dirname, '../../public/') })
  })

  app.get('/cataloguing', (req, res, next) => {
    res.sendFile('main.html', { title: 'Katalogisering', root: path.join(__dirname, '../../public/') })
  })

  app.get('/version', (request, response) => {
    response.json({ 'buildTag': process.env.BUILD_TAG, 'gitref': process.env.GITREF })
  })

  app.get('/valueSuggestions/demo_:source/:isbn', (req, res, next) => {
    res.sendFile(`${req.params.source}_${req.params.isbn}.json`, { root: path.join(__dirname, '../../public/example_data') })
  })

  app.get('/*', (req, res, next) => {
    if (req.url.indexOf('config') !== -1 ||
      req.url.indexOf('.png') !== -1 ||
      req.url.indexOf('css') !== -1 ||
      req.url.indexOf('html') !== -1 ||
      req.url.indexOf('.js') !== -1 ||
      req.url.indexOf('ontology') !== -1 ||
      req.url.indexOf('authorized_values') !== -1) {
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.setHeader('Expires', new Date(Date.now() + 3600000).toUTCString())
    }
    next()
  })

  app.get('/js/bundle.js',
    babelify([{ './client/src/bootstrap': { run: true } }])
  )

  app.get('/js/bundle_for_old.js',
    babelify([{ './client/src/bootstrap_old': { run: true } }]))

  app.get('/css/vendor/:cssFile', (request, response) => {
    response.sendFile(request.params.cssFile, { root: path.resolve(path.join(__dirname, '../../node_modules/select2/dist/css/')) })
  })
}
