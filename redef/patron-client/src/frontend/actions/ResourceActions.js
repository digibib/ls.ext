import fetch from 'isomorphic-fetch'

import * as types from '../constants/ActionTypes'
import { parsePersonResponse, parseWorkResponse } from '../utils/graphParse'

export function requestResource (uri) {
  return {
    type: types.REQUEST_RESOURCE,
    payload: {
      uri: uri
    }
  }
}

export function receiveResource (uri, resource) {
  return {
    type: types.RECEIVE_RESOURCE,
    payload: {
      uri: uri,
      resource: resource
    }
  }
}

export function resourceFailure (error) {
  return {
    type: types.RESOURCE_FAILURE,
    payload: {
      message: error
    },
    error: true
  }
}

export function getPersonResource (uri) {
  let personResponse
  let worksResponse
  return dispatch => {
    dispatch(requestResource(uri))
    return fetch(uri)
      .then(response => response.json())
      .then(json => {
        personResponse = json
        return fetch(uri + '/works')
      })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        }
      })
      .then(json => {
        worksResponse = json
      })
      .then(() => parsePersonResponse(uri, personResponse, worksResponse))
      .then(person => dispatch(receiveResource(uri, person)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export function getWorkResource (uri) {
  let workResponse
  let itemsResponse
  return dispatch => {
    dispatch(requestResource(uri))
    return fetch(uri)
      .then(response => response.json())
      .then(json => {
        workResponse = json
        return fetch(uri + '/items')
      })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        }
      })
      .then(json => {
        itemsResponse = json
      })
      .then(() => parseWorkResponse(uri, workResponse, itemsResponse))
      .then(work => dispatch(receiveResource(uri, work)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}
