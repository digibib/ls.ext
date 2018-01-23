import { SEARCH_FAILURE, RECEIVE_SEARCH, REQUEST_SEARCH, TOGGLE_SEARCH_BAR, ENABLE_SEARCH_BAR, DISABLE_SEARCH_BAR } from '../constants/ActionTypes'

const initialState = {
  searchResults: [],
  filtersByQuery: {},
  filters: [],
  isSearching: false,
  totalHits: 0,
  totalHitsPublications: 0,
  searchError: false,
  inputQuery: '',
  displaySearchBar: true
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
    case TOGGLE_SEARCH_BAR:
      return {
        ...state,
        displaySearchBar: !state.displaySearchBar
      }
    case ENABLE_SEARCH_BAR:
      return {
        ...state,
        displaySearchBar: true
      }
    case DISABLE_SEARCH_BAR:
      return {
        ...state,
        displaySearchBar: false
      }
    default:
      return state
  }
}
