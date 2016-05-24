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

export function fetchPersonResource (personId) {
  return (dispatch, getState) => {
    if (getState().resources.resources[ personId ]) {
      return
    }
    const url = `${Constants.backendUri}/person/${personId}`
    dispatch(requestResource(personId))
    return Promise.all([
      fetch(url).then(response => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw Error('Error fetching person resource')
        }
      }),
      fetch(`${url}/works`).then(response => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw Error('Error fetching works for person')
        }
      }) ]
    ).then(([personResponse, worksResponse]) => parsePersonResponse(personResponse, worksResponse))
      .then(person => dispatch(receiveResource(personId, person)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export function fetchWorkResource (workId) {
  return (dispatch, getState) => {
    if (getState().resources.resources[ workId ]) {
      return
    }
    const url = `${Constants.backendUri}/work/${workId}`
    dispatch(requestResource(workId))
    return Promise.all([
      fetch(url).then(response => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw Error('Error fetching work resource')
        }
      }),
      fetch(`${url}/items`).then(response => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw Error('Error fetching items for work')
        }
      }) ]
    ).then(([worksResponse, itemsResponse]) => parseWorkResponse(worksResponse, itemsResponse))
      .then(work => dispatch(receiveResource(workId, work)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}
