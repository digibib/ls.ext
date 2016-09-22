import fetch from 'isomorphic-fetch'
import Constants from '../constants/Constants'

export default (values) => {
  return new Promise((resolve, reject) => {
    //isomorphic fetch requires absolute urls
    fetch(`${Constants.baseURL}/api/v1/validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: values })
    }).then(response => response.json())
      .then(json => {
        if (Object.keys(json.errors).length === 0) {
          resolve()
        } else {
          reject(json.errors)
        }
      })
  })
}
