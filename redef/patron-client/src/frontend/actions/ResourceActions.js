import fetch from 'isomorphic-fetch'
import { push } from 'react-router-redux'

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

export function expandSubResource (id, router) {
  return (dispatch, getState) => {
    let locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    locationQuery.showMore = id

    let url = router.createPath({
      pathname: getState().routing.locationBeforeTransitions.pathname,
      query: locationQuery
    })
    return dispatch(push(url))
  }
}

export function getPersonResource (url) {
  let personResponse
  let worksResponse
  return dispatch => {
    dispatch(requestResource(url))
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        personResponse = json
        return fetch(`${url}/works`)
      })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        }
      })
      .then(json => {
        worksResponse = json
      })
      .then(() => parsePersonResponse(personResponse, worksResponse))
      .then(person => dispatch(receiveResource(url, person)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export function getWorkResource (url) {
  let workResponse
  let itemsResponse
  return dispatch => {
    dispatch(requestResource(url))
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        workResponse = json
        return fetch(`${url}/items`)
      })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        }
      })
      .then(json => {
        itemsResponse = json
      })
      .then(() => parseWorkResponse(workResponse, itemsResponse))
      .then(work => dispatch(receiveResource(url, work)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}
