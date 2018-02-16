import {
  FETCH_HISTORY_FAILURE,
  REQUEST_FETCH_HISTORY,
  RECEIVE_FETCH_HISTORY,
  UPDATE_HISTORY,
  RESET_HISTORY,
  SET_CURRENT_LOADED_HISTORY_ITEMS,
  SET_NO_HISTORY_TO_FETCH,
  DELETE_ALL_HISTORY,
  DELETE_ALL_HISTORY_SUCCESS,
  DELETE_ALL_HISTORY_FAILURE
} from '../constants/ActionTypes'

const initialState = {
  isRequestingHistory: false,
  fetchHistoryFailure: false,
  historyData: [],
  allLoadedHistory: [],
  historyToDelete: [],
  moreToFetch: true,
  loadedHistoryItems: 0,
  isRequestingDeleteAllHistory: false,
  isRequestingDeleteHistory: false
}

export default function loan (state = initialState, action) {
  switch (action.type) {
    case SET_NO_HISTORY_TO_FETCH:
      return { ...state, moreToFetch: false }
    case SET_CURRENT_LOADED_HISTORY_ITEMS:
      return { ...state, isRequestingHistory: false, loadedHistoryItems: action.payload.items }
    case RESET_HISTORY:
      return { ...state, moreToFetch: true, allLoadedHistory: [], historyData: [], loadedHistoryItems: 0 }
    case REQUEST_FETCH_HISTORY:
      return { ...state, isRequestingHistory: true, fetchHistoryFailure: false }
    case RECEIVE_FETCH_HISTORY:
      return { ...state, fetchHistoryFailure: false, historyData: action.payload.history }
    case UPDATE_HISTORY:
      return { ...state, fetchHistoryFailure: false, allLoadedHistory: action.payload.historyAll }
    case FETCH_HISTORY_FAILURE:
      return { ...state, isRequestingHistory: false, fetchHistoryFailure: true }
    case DELETE_ALL_HISTORY:
      return { ...state, isRequestingDeleteAllHistory: true }
    case DELETE_ALL_HISTORY_SUCCESS:
      return { ...state, isRequestingDeleteAllHistory: false, historyData: [], allLoadedHistory: [], moreToFetch: false, loadedHistoryItems: 0 }
    case DELETE_ALL_HISTORY_FAILURE:
      return { ...state, isRequestingDeleteAllHistory: false }
    default:
      return state
  }
}
