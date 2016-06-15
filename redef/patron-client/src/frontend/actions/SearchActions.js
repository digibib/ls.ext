import fetch from 'isomorphic-fetch'

import Constants from '../constants/Constants'
import * as types from '../constants/ActionTypes'
import { filteredSearchQuery } from '../utils/searchBuilder'
import { processSearchResponse } from '../utils/searchResponseParser'
import { toggleParameterValue } from './ParameterActions'

export function requestSearch (inputQuery, elasticSearchQuery) {
  return {
    type: types.REQUEST_SEARCH,
    payload: {
      inputQuery: inputQuery,
      elasticSearchQuery: elasticSearchQuery
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
    const page = locationQuery.page
    const inputQuery = locationQuery.query

    const uri = page
      ? `${Constants.backendUri}/search/publication/_search?from=${(page - 1) * Constants.maxSearchResultsPerPage}`
      : `${Constants.backendUri}/search/publication/_search`

    const elasticSearchQuery = filteredSearchQuery(locationQuery)
    dispatch(requestSearch(inputQuery, elasticSearchQuery))

    return fetch(uri, {
      method: 'POST', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, body: JSON.stringify(elasticSearchQuery)
    })
      .then(response => response.json())
      .then(json => processSearchResponse(json, locationQuery))
      .then(processedResponse => {
        if (processedResponse.error) {
          throw Error(processedResponse)
        } else {
          dispatch(receiveSearch(processedResponse))
        }
      })
      .catch(error => dispatch(searchFailure(error)))
  }
}

export function showStatus (relativeUri) {
  return toggleParameterValue('showStatus', relativeUri)
}
