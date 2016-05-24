import fetch from 'isomorphic-fetch'
import { push, replace } from 'react-router-redux'

import * as types from '../constants/ActionTypes'
import { parsePersonResponse, parseWorkResponse } from '../utils/graphParse'
import Constants from '../constants/Constants'

export function requestResource (id) {
  return {
    type: types.REQUEST_RESOURCE,
    payload: {
      id: id
    }
  }
}

export function receiveResource (id, resource) {
  return {
    type: types.RECEIVE_RESOURCE,
    payload: {
      id: id,
      resource: resource
    }
  }
}

export function resourceFailure (error) {
  console.log(error)
  return {
    type: types.RESOURCE_FAILURE,
    payload: error,
    error: true
  }
}

export function expandSubResource (id, replacePath) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    if (!id) {
      delete locationQuery.showMore
    } else if (locationQuery.showMore === id) {
      return
    } else {
      locationQuery.showMore = id
    }
    const locationDescriptor = {
      pathname: getState().routing.locationBeforeTransitions.pathname,
      query: locationQuery
    }
    return replacePath
      ? dispatch(replace(locationDescriptor))
      : dispatch(push(locationDescriptor))
  }
}

export function fetchPersonResource (personId) {
  return (dispatch, getState) => {
    if (getState().resources.resources[ personId ]) {
      return
    }
    let personResponse
    let worksResponse
    const url = `${Constants.backendUri}/person/${personId}`
    dispatch(requestResource(personId))
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
      .then(person => dispatch(receiveResource(personId, person)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export function fetchWorkResource (workId) {
  return (dispatch, getState) => {
    if (getState().resources.resources[ workId ]) {
      return
    }
    let workResponse
    let itemsResponse
    const url = `${Constants.backendUri}/work/${workId}`
    dispatch(requestResource(workId))
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
      .then(work => dispatch(receiveResource(workId, work)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}
