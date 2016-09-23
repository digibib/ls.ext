import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { mapLibraries } from '../utils/libraryMapper'

export function requestLibraries () {
  return {
    type: types.REQUEST_LIBRARIES
  }
}

export function receiveLibraries (libraries, fromStorage) {
  if (!fromStorage && process.env.NODE_ENV !== 'server' && sessionStorage) {
    sessionStorage.setItem('libraries', JSON.stringify(libraries))
  }
  return {
    type: types.RECEIVE_LIBRARIES,
    payload: {
      libraries: libraries
    }
  }
}

export function librariesFailure (error) {
  console.log(error)
  return {
    type: types.LIBRARIES_FAILURE,
    payload: {
      message: error
    },
    error: true
  }
}

export function fetchLibraries () {
  return dispatch => {
    dispatch(requestLibraries())

    if (process.env.NODE_ENV !== 'server' && sessionStorage && sessionStorage.libraries) {
      return dispatch(receiveLibraries(JSON.parse(sessionStorage.libraries), true))
    } else {
      return fetch('/api/v1/libraries', {
        method: 'GET'
      })
        .then(response => {
          if (response.status === 200) {
            return response.json()
          } else {
            throw Error('Error fetching libraries')
          }
        })
        .then(json => dispatch(receiveLibraries(mapLibraries(json))))
        .catch(error => dispatch(librariesFailure(error)))
    }
  }
}
