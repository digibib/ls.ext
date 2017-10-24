import fetch from 'isomorphic-fetch'
import {push, replace} from 'react-router-redux'
import * as types from '../constants/ActionTypes'
import {parsePersonResponse} from '../utils/graphParse'
import {action, errorAction} from './GenericActions'

export const requestResource = id => action(types.REQUEST_RESOURCE, { id })

export const receiveResource = (id, resource) => action(types.RECEIVE_RESOURCE, { id, resource })

export const resourceFailure = error => errorAction(types.RESOURCE_FAILURE, error)

export function fetchPersonResource (personId) {
  return (dispatch, getState) => {
    if (getState().resources.resources[ personId ]) {
      return
    }
    const url = `/api/v1/resources/person/${personId}`
    dispatch(requestResource(personId))
    // TODO merge theese two calls backend instead
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
        } else if (response.status === 204) {
          return
        } else {
          throw Error('Error fetching works for person')
        }
      }) ]
    ).then(([ personResponse, worksResponse ]) => parsePersonResponse(personResponse, worksResponse))
      .then(person => dispatch(receiveResource(personId, person)))
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export function fetchWorkResource (workId) {
  return (dispatch, getState) => {
    if (getState().resources.resources[ workId ]) {
      return
    }
    const url = `/api/v1/resources/work/${workId}`
    dispatch(requestResource(workId))
    return fetch(url).then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw Error('Error fetching work resource')
      }
    }).then(work => dispatch(receiveResource(workId, work)))
      .then(() => dispatch(fetchWorkItems(workId))) // NB: Maybe not in use?
      .catch(error => dispatch(resourceFailure(error)))
  }
}

export const requestItems = workId => action(types.REQUEST_ITEMS, { workId })

export const receiveItems = (workId, items) => action(types.RECEIVE_ITEMS, { workId, items })

export const itemsFailure = error => errorAction(types.ITEMS_FAILURE, error)

export function fetchWorkItems (workId) {
  return (dispatch, getState) => {
    const url = `/api/v1/resources/work/${workId}/items`
    dispatch(requestItems(workId))
    return fetch(url).then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw Error('Error fetching items for work')
      }
    }).then(items => dispatch(receiveItems(workId, processItems(items, getState().resources.resources[ workId ]))))
      .catch(error => dispatch(itemsFailure(error)))
  }
}

function processItems (allItems, work) {
  if (work) {
    work.publications.forEach(publication => {
      const items = (allItems[ publication.recordId ] || {}).items
      if (items) {
        items.forEach(item => {
          item.mediaTypes = publication.mediaTypes
          item.languages = publication.languages
        })
      }
    })
  }
  return allItems
}

// TODO Refactor method logic to ParameterActions
export function expandSubResource (id, replacePath) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    delete locationQuery.showDetails // clean any display items or parts state
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

export function updateUrlQueryValue (parameter, value, replacePath) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    if (!value) {
      delete locationQuery[ parameter ]
    } else if (locationQuery[ parameter ] === value) {
      return
    } else {
      locationQuery[ parameter ] = value
    }
    locationQuery[ 'showFilter' ] = [ 'language' ]
    const locationDescriptor = {
      pathname: getState().routing.locationBeforeTransitions.pathname,
      query: locationQuery
    }
    return replacePath
      ? dispatch(replace(locationDescriptor))
      : dispatch(push(locationDescriptor))
  }
}

export const toggleShowAdditionalInformation = workId => action(types.TOGGLE_SHOW_ADDITIONAL_INFORMATION, { workId })
