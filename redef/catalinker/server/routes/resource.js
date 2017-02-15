const axios = require('axios')

module.exports = (app) => {
  app.get('/:type(person|work|publication|place|serial|corporation|subject|genre|workSeries)', (req, res, next) => {
    newResource(req.params.type)
    .then(response => {
      res.redirect('/cataloguing_old/' + req.params.type + '?resource=' + response.headers.location)
    })
    .catch(response => {
      if (response instanceof Error) {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', response.message)
      } else {
        // The request was made, but the server responded with a status code
        // that falls out of the range of 2xx
        console.log(response.data)
        console.log(response.status)
        console.log(response.headers)
        console.log(response.config)
      }
    })
  })

  function newResource (type) {
    return axios.post(process.env.SERVICES_PORT + '/' + type, {}, {
      headers: {
        Accept: 'application/ld+json',
        'Content-Type': 'application/ld+json'
      }
    })
  }
}
