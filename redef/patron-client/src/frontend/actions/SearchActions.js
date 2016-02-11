import fetch from 'isomorphic-fetch'

import Constants from '../constants/Constants'
import * as types from '../constants/ActionTypes'
import { aggregationQuery, filteredSearchQuery } from '../utils/searchBuilder'
import { processSearchResponse, processAggregationResponse } from '../utils/searchResponseParser'

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
      totalHits: processedResponse.totalHits
    }
  }
}

export function requestAggregation (inputQuery, elasticSearchQuery) {
  return {
    type: types.REQUEST_AGGREGATION,
    payload: {
      inputQuery: inputQuery,
      elasticSearchQuery: elasticSearchQuery
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

export function aggregationFailure (error) {
  return {
    type: types.AGGREGATION_FAILURE,
    payload: {
      message: error
    },
    error: true
  }
}

export function receiveAggregation (processedResponse, inputQuery) {
  return {
    type: types.RECEIVE_AGGREGATION,
    payload: {
      filters: processedResponse.filters,
      inputQuery: inputQuery
    }
  }
}

export function aggregate (inputQuery) {
  let elasticSearchQuery = aggregationQuery(inputQuery)
  return dispatch => {
    dispatch(requestAggregation(inputQuery, elasticSearchQuery))
    return fetch(Constants.backendUri + '/search/work/_search', {
      method: 'POST', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, body: JSON.stringify(elasticSearchQuery)
    })
      .then(response => response.json())
      .then(json => processAggregationResponse(json))
      .then(processedResponse => dispatch(receiveAggregation(processedResponse, inputQuery)))
      .catch(error => dispatch(aggregationFailure(error)))
  }
}

export function search (inputQuery, filters) {
  let elasticSearchQuery = filteredSearchQuery(inputQuery, filters)
  return (dispatch, getState) => {
    const { search } = getState()
    if (!search.filtersByQuery[ inputQuery ]) {
      dispatch(aggregate(inputQuery))
    }
    dispatch(requestSearch(inputQuery, elasticSearchQuery))
    return fetch(Constants.backendUri + '/search/work/_search', {
      method: 'POST', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, body: JSON.stringify(elasticSearchQuery)
    })
      .then(response => response.json())
      .then(json => processSearchResponse(json))
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
