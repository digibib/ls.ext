const isofetch = require('isomorphic-fetch')

module.exports = (app) => {
  return (url, opts) => {
    opts = opts || {}
    opts.headers = opts.headers || {}
    opts.headers[ 'Cookie' ] = app.settings.kohaSession
    return isofetch(url, opts)
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          const dup = res.clone() // duplicate body for logging
          return dup.json().then(json => {
            if (res.status >= 400) {
              console.log(`Call to ${url} with options ${JSON.stringify(opts)}:`)
              console.log(`${res.status}: ${JSON.stringify(json)}`)
            }
            if (json.error === 'Authentication required.' || json.error === 'Authentication failure.') {
              // Unauthorized; we try to renew session and then retry request.
              return isofetch('http://xkoha:8081/api/v1/auth/session', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                body: `userid=${encodeURIComponent(process.env.KOHA_API_USER)}&password=${encodeURIComponent(process.env.KOHA_API_PASS)}`
              })
                .then(res => {
                  if (res.headers && res.headers._headers && res.headers._headers[ 'set-cookie' ] && res.headers._headers[ 'set-cookie' ][ 0 ]) {
                    app.set('kohaSession', res.headers._headers[ 'set-cookie' ][ 0 ])
                    opts.headers[ 'Cookie' ] = app.settings.kohaSession

                    // We renewed the session; retry original HTTP call (once)
                    return isofetch(url, opts)
                  } else {
                    throw new Error('Cannot obtain Koha API session')
                  }
                })
            } else {
              return res
            }
          })
        } else {
          return res
        }
      })
  }
}
