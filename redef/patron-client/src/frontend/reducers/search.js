import { SEARCH_FAILURE, RECEIVE_SEARCH, REQUEST_SEARCH, RECEIVE_AGGREGATION, REQUEST_AGGREGATION } from '../constants/ActionTypes'

const initialState = {
  searchResults: [],
  filtersByQuery: {},
  filters: [],
  searchQuery: '',
  isSearching: false,
  isRequestingAggregation: false,
  totalHits: 0,
  isError: false
}

export default function search (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_SEARCH:
      return Object.assign({}, state, {
        searchResults: action.payload.searchResults,
        totalHits: action.payload.totalHits,
        isSearching: false,
        isError: false
      })
    case SEARCH_FAILURE:
      return Object.assign({}, state, {
        isSearching: false,
        isError: true
      })
    case RECEIVE_AGGREGATION:
      let filtersByQuery = {}
      filtersByQuery[ action.payload.inputQuery ] = action.payload.filters
      filtersByQuery = Object.assign({}, state.filtersByQuery, filtersByQuery)
      return Object.assign({}, state, {
        filtersByQuery: filtersByQuery,
        isRequestingAggregation: false
      })
    case REQUEST_AGGREGATION:
      return Object.assign({}, state, {
        isRequestingAggregation: true
      })
    case REQUEST_SEARCH:
      return Object.assign({}, state, {
        isSearching: true,
        inputQuery: action.payload.inputQuery,
        elasticSearchQuery: action.payload.elasticSearchQuery
      })
    default:
      return state
  }
}
