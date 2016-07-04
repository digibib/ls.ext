const isofetch = require('isomorphic-fetch')

module.exports = function(app) {
  return function(url, opts) {
    opts = opts || {}
    opts.headers = opts.headers || {}
    opts.headers['Cookie'] = app.settings.kohaSession
    return isofetch(url, opts)
    .then(res => {
      if (res.status === 403) {
        // Unauthorized; we try to renew session and then retry request.
        return isofetch('http://koha:8081/api/v1/auth/session', {
            method: 'POST',
            body: JSON.stringify({
              userid: process.env.KOHA_API_USER,
              password: process.env.KOHA_API_PASS
            })
        })
        .then(res => {
          if (res.headers && res.headers._headers && res.headers._headers[ 'set-cookie' ] && res.headers._headers[ 'set-cookie' ][ 0 ]) {
            app.set('kohaSession', res.headers._headers[ 'set-cookie' ][ 0 ])
            opts.headers['Cookie'] = app.settings.kohaSession
            return isofetch(url, opts)
          } else {
            throw "Cannot obtain Koha API session"
          }
        })
      } else {
        // normal path (non-error)
        return new Promise(function(resolve, reject) {
          resolve(res)
        })
      }
    })
    .catch(err => {
      // normal path (on error)
      return new Promise(function(resolve, reject) {
        reject(Error(err))
      })
    })
  }
}