import { SEARCH_FAILURE, RECEIVE_SEARCH, REQUEST_SEARCH } from '../constants/ActionTypes'

const initialState = {
  searchResults: [],
  filtersByQuery: {},
  filters: [],
  isSearching: false,
  totalHits: 0,
  totalHitsPublications: 0,
  searchError: false,
  inputQuery: ''
}

export default function search (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_SEARCH:
      return {
        ...state,
        searchResults: action.payload.searchResults,
        totalHits: action.payload.totalHits,
        totalHitsPublications: action.payload.totalHitsPublications,
        filters: action.payload.filters,
        isSearching: false,
        searchError: false
      }
    case SEARCH_FAILURE:
      return {
        ...state,
        isSearching: false,
        searchError: action.payload.message
      }
    case REQUEST_SEARCH:
      return {
        ...state,
        isSearching: true,
        inputQuery: action.payload.inputQuery
      }
    default:
      return state
  }
}
