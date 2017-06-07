import {
  FETCH_HISTORY_FAILURE,
  REQUEST_FETCH_HISTORY,
  RECEIVE_FETCH_HISTORY
} from '../constants/ActionTypes'


const initialState = {
  isRequestingHistory: false,
  fetchHistoryFailure: false,
  historyData: []
}

export default function loan (state = initialState, action) {
  switch (action.type) {
    case REQUEST_FETCH_HISTORY:
      return { ...state, isRequestingHistory: true, fetchHistoryFailure: false }
    case RECEIVE_FETCH_HISTORY:
      return { ...state, isRequestingHistory: false, fetchHistoryFailure: false, historyData: action.payload.history }
    case FETCH_HISTORY_FAILURE:
      return { ...state, isRequestingHistory: false, fetchHistoryFailure: true }
    default:
      return state
  }
}
