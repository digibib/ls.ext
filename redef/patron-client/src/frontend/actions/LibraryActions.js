import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { sortByField } from '../utils/sorting'

export function requestLibraries () {
  return {
    type: types.REQUEST_LIBRARIES
  }
}

export function receiveLibraries (libraries) {
  const mappedLibraries = {}
  sortByField(libraries, 'branchname').forEach(library => {
    mappedLibraries[library.branchcode] = library.branchname
  })

  return {
    type: types.RECEIVE_LIBRARIES,
    payload: {
      libraries: mappedLibraries
    }
  }
}

export function librariesFailure (error) {
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
      .then(json => dispatch(receiveLibraries(json)))
      .catch(error => dispatch(librariesFailure(error)))
  }
}
