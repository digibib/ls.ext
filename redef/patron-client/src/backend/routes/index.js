const path = require('path')

module.exports = (app) => {
  require('./auth')(app)
  require('./checkouts')(app)
  require('./holds')(app)
  require('./profile')(app)
  require('./libraries')(app)
  require('./registration')(app)
  require('./resources')(app)
  require('./search')(app)
  require('./validation')(app)

  app.get('*', (request, response) => {
    response.sendFile(path.resolve(__dirname, '..', '..', '..', 'public', 'dist', 'index.html'))
  })
}
