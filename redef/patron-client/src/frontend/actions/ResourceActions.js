import fetch from 'isomorphic-fetch'
import { push, replace } from 'react-router-redux'

import * as types from '../constants/ActionTypes'
import { parsePersonResponse, parseWorkResponse } from '../utils/graphParse'
import Constants from '../constants/Constants'

export function requestResource (uri) {
  return {
    type: types.REQUEST_RESOURCE,
    payload: {
      uri: uri
    }
  }
}

export function receiveResource (relativeUri, resource) {
  return {
    type: types.RECEIVE_RESOURCE,
    payload: {
      relativeUri: relativeUri,
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

export function expandSubResource (id, replacePath) {
  return (dispatch, getState) => {
    let locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    if (!id) {
      delete locationQuery.showMore
    } else if (locationQuery.showMore === id) {
      return
    } else {
      locationQuery.showMore = id
    }
    let locationDescriptior = {
      pathname: getState().routing.locationBeforeTransitions.pathname,
      query: locationQuery
    }
    return replacePath
      ? dispatch(replace(locationDescriptior))
      : dispatch(push(locationDescriptior))
  }
}

export function fetchPersonResource (relativeUri) {
  let personResponse
  let worksResponse
  const url = `${Constants.backendUri}${relativeUri}`
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
      .then(person => dispatch(receiveResource(relativeUri, person)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export function fetchWorkResource (relativeUri) {
  let workResponse
  let itemsResponse
  const url = `${Constants.backendUri}${relativeUri}`
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
      .then(work => dispatch(receiveResource(relativeUri, work)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}
