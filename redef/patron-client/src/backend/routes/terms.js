const path = require('path')

module.exports = (app) => {
  app.get('/terms', (request, response) => {
    response.sendFile(path.resolve(__dirname, '..', '..', '..', 'public', 'dist', 'terms.html'))
  })
}
