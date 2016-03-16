import fetch from 'isomorphic-fetch'

import Constants from '../constants/Constants'
import * as types from '../constants/ActionTypes'
import { filteredSearchQuery } from '../utils/searchBuilder'
import { processSearchResponse } from '../utils/searchResponseParser'

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
      filters: processedResponse.filters
    }
  }
}

export function searchFailure (error) {
  return {
    type: types.SEARCH_FAILURE,
    payload: {
      message: error
    },
    error: true
  }
}

export function search () {
  return (dispatch, getState) => {
    let locationQuery = getState().routing.locationBeforeTransitions.query
    if (!locationQuery || !locationQuery.query) {
      return
    }
    let page = locationQuery.page
    let inputQuery = locationQuery.query

    let uri = page
      ? `${Constants.backendUri}/search/work/_search?from=${(page - 1) * Constants.searchQuerySize}`
      : `${Constants.backendUri}/search/work/_search`

    let elasticSearchQuery = filteredSearchQuery(locationQuery)
    dispatch(requestSearch(inputQuery, elasticSearchQuery))

    return fetch(uri, {
      method: 'POST', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, body: JSON.stringify(elasticSearchQuery)
    })
      .then(response => response.json())
      .then(json => processSearchResponse(json, inputQuery))
      .then(processedResponse => {
        if (processedResponse.error) {
          return dispatch(searchFailure(processedResponse))
        } else {
          return dispatch(receiveSearch(processedResponse))
        }
      })
      .catch(error => dispatch(searchFailure(error)))
  }
}
