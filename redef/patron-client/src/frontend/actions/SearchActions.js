import fetch from 'isomorphic-fetch'

import * as types from '../constants/ActionTypes'
import { processSearchResponse } from '../utils/searchResponseParser'
import { toggleParameterValue, ensureDefinedFiltersOpen } from './ParameterActions'

export function requestSearch (inputQuery, elasticSearchQuery) {
  return {
    type: types.REQUEST_SEARCH,
    payload: {
      inputQuery: inputQuery
    }
  }
}

export function receiveSearch (processedResponse) {
  return {
    type: types.RECEIVE_SEARCH,
    payload: {
      searchResults: processedResponse.searchResults,
      totalHits: processedResponse.totalHits,
      totalHitsPublications: processedResponse.totalHitsPublications,
      filters: processedResponse.filters
    }
  }
}

export function searchFailure (error) {
  console.log(error)
  return {
    type: types.SEARCH_FAILURE,
    payload: error,
    error: true
  }
}

export function search () {
  return (dispatch, getState) => {
    const locationQuery = getState().routing.locationBeforeTransitions.query
    if (!locationQuery || !locationQuery.query) {
      return
    }

    const inputQuery = locationQuery.query
    dispatch(requestSearch(inputQuery))

    return fetch(`/q${getState().routing.locationBeforeTransitions.search}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => processSearchResponse(json, locationQuery))
      .then(processedResponse => {
        if (processedResponse.error) {
          throw Error(processedResponse)
        } else {
          dispatch(ensureDefinedFiltersOpen(locationQuery))
          dispatch(receiveSearch(processedResponse))
        }
      })
      .catch(error => dispatch(searchFailure(error)))
  }
}

export function showStatus (relativeUri) {
  return toggleParameterValue('showStatus', relativeUri)
}

export function showUnfilteredStatus (relativeUri) {
  return toggleParameterValue('showUnfilteredStatus', relativeUri)
}

export function showBranchStatus (branchCode) {
  return toggleParameterValue('showBranchStatus', branchCode)
}

export function showBranchStatusMedia (branchCodeMedia) {
  return toggleParameterValue('showBranchStatusMedia', branchCodeMedia)
}
