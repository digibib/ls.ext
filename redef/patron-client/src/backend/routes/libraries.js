const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.get('/api/v1/libraries', jsonParser, (request, response) => {
    fetch('http://xkoha:8081/api/v1/libraries')
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(json => response.status(200).send(filterLibraries(json)))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  function filterLibraries (libraries) {
    return libraries.filter(l => {
      return l.branchnotes === null // filter out branches with branchnotes
    }).filter(l => {
      if ([ 'hutl', 'fbje', 'fbjo', 'fbol', 'ffur', 'fgry', 'fhol',
        'flam', 'fmaj', 'fnor', 'fnyd', 'fopp', 'frik', 'frmm', 'from', 'froa',
        'fsme', 'fsto', 'ftor', 'fgam' ].includes(l.branchcode)) {
        return true
      } else {
        // allow test branch codes also
        return (/^[a-f0-9]{8}$/.test(l.branchcode))
      }
    })
  }
}
