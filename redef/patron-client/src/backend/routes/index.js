const requestProxy = require('express-request-proxy')
const path = require('path')

module.exports = (app) => {
  require('./auth')(app)
  require('./checkouts')(app)
  require('./holds')(app)
  require('./profile')(app)
  require('./libraries')(app)
  require('./registration')(app)
  require('./search')(app)
  require('./validation')(app)

  app.all('/services/*', requestProxy({
    url: 'http://services:8005/*',
    timeout: 30 * 1000 // 30 seconds
  }))

  app.get('*', (request, response) => {
    response.sendFile(path.resolve(__dirname, '..', '..', '..', 'public', 'dist', 'index.html'))
  })
}
