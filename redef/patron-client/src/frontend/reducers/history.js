import {
  FETCH_HISTORY_FAILURE,
  REQUEST_FETCH_HISTORY,
  RECEIVE_FETCH_HISTORY,
  UPDATE_HISTORY,
  RESET_HISTORY,
  SET_CURRENT_LOADED_HISTORY_ITEMS,
  SET_NO_HISTORY_TO_FETCH
} from '../constants/ActionTypes'

const initialState = {
  isRequestingHistory: false,
  fetchHistoryFailure: false,
  historyData: [],
  allLoadedHistory: [],
  moreToFetch: true,
  loadedHistoryItems: 0
}

export default function loan (state = initialState, action) {
  switch (action.type) {
    case SET_NO_HISTORY_TO_FETCH:
      return { ...state, moreToFetch: false }
    case SET_CURRENT_LOADED_HISTORY_ITEMS:
      return { ...state, loadedHistoryItems: action.payload.items }
    case RESET_HISTORY:
      return { ...state, moreToFetch: true, allLoadedHistory: [], historyData: [], loadedHistoryItems: 0 }
    case REQUEST_FETCH_HISTORY:
      return { ...state, isRequestingHistory: true, fetchHistoryFailure: false }
    case RECEIVE_FETCH_HISTORY:
      return { ...state, isRequestingHistory: false, fetchHistoryFailure: false, historyData: action.payload.history, moreToFetch: action.payload.history.length > 0  }
    case UPDATE_HISTORY:
      return { ...state, isRequestingHistory: false, fetchHistoryFailure: false, allLoadedHistory: action.payload.historyAll }
    case FETCH_HISTORY_FAILURE:
      return { ...state, isRequestingHistory: false, fetchHistoryFailure: true }
    default:
      return state
  }
}
