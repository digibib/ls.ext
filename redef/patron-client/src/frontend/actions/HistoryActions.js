import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import Errors from '../constants/Errors'
import { action } from './GenericActions'
import merge from '../utils/mergeArraysOfObjects'

export function startFetchHistory (args) {
  return requireLoginBeforeAction(fetchHistory(args))
}

export function fetchHistoryFailure (error) {
  return dispatch => {
    dispatch({
      type: types.FETCH_HISTORY_FAILURE,
      payload: { message: error },
      error: true
    })
  }
}

export const resetHistory = () => action(types.RESET_HISTORY)

export const requestHistory = () => action(types.REQUEST_FETCH_HISTORY)

export const receiveHistory = data => action(types.RECEIVE_FETCH_HISTORY, { history: data })

export const requestUpdateHistory = (data) => action(types.UPDATE_HISTORY, { historyAll: data })

export const setCurrentLoadedNumber = (number) => action(types.SET_CURRENT_LOADED_HISTORY_ITEMS, { items: number })

export const setNoHistoryToFetch = () => action(types.SET_NO_HISTORY_TO_FETCH)

export function fetchHistory (args) {
  const url = '/api/v1/profile/history'
  return (dispatch, getState) => {
    dispatch(requestHistory())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(json => {
            dispatch(receiveHistory(json))
            dispatch(updateHistory())
            console.log(json.length)
            if (json.length === 0) {
              dispatch(setNoHistoryToFetch())
            }
          })
        } else {
          dispatch(fetchHistoryFailure(Errors.loan.GENERIC_FETCH_HISTORY_ERROR))
        }
      }).catch(error => dispatch(fetchHistoryFailure(error)))
  }
}

export function updateHistory () {
  return (dispatch, getState) => {
    const { historyData, allLoadedHistory } = getState().history
    const mergedHistory = merge(historyData, allLoadedHistory, 'issue_id')
    dispatch(requestUpdateHistory(mergedHistory))
    dispatch(setCurrentLoadedNumber(mergedHistory.length))
  }
}
