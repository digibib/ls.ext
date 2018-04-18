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

export function deleteAllHistoryFailure (error) {
  return dispatch => {
    dispatch({
      type: types.DELETE_ALL_HISTORY_FAILURE,
      payload: { message: error },
      error: true
    })
  }
}

export function deleteHistoryFailure (error) {
  return dispatch => {
    dispatch({
      type: types.DELETE_HISTORY_FAILURE,
      payload: { message: error },
      error: true
    })
  }
}

export function deleteAllHistory () {
  return (dispatch, getState) => {
    const url = `/api/v1/profile/history`
    dispatch(requestDeleteAllHistory())
    return fetch(url, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 200) {
        dispatch(action(types.DELETE_ALL_HISTORY_SUCCESS))
      } else {
        dispatch(deleteAllHistoryFailure(Errors.history.GENERIC_DELETE_HISTORY_ERROR))
      }
    }).catch(error => dispatch(deleteAllHistoryFailure(error)))
  }
}

export function deleteHistory () {
  return (dispatch, getState) => {
    const ids = getState().history.historyToDelete
    Promise.all(ids.map(id => {
      const url = `/api/v1/profile/history/${id}`
      return fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      })
    })).then(responses => {
      responses.forEach(r => {
        if (r.status !== 200) {
          console.log(r.status)
          throw new Error('failed')
        }
      })
      const { allLoadedHistory } = getState().history
      const newHistory = allLoadedHistory.filter(i => !ids.includes(i.id))
      dispatch(requestUpdateHistory(newHistory))
      dispatch(setCurrentLoadedNumber(newHistory.length))
      dispatch(action(types.DELETE_HISTORY_SUCCESS))
    }).catch(() => dispatch(deleteHistoryFailure(Errors.history.GENERIC_DELETE_HISTORY_ERROR)))
  }
}

export const resetHistory = () => action(types.RESET_HISTORY)

export const requestHistory = () => action(types.REQUEST_FETCH_HISTORY)

export const requestDeleteHistory = () => action(types.REQUEST_DELETE_HISTORY)

export const requestDeleteAllHistory = () => action(types.REQUEST_DELETE_ALL_HISTORY)

export const receiveHistory = data => action(types.RECEIVE_FETCH_HISTORY, { history: data })

export const requestUpdateHistory = (data) => action(types.UPDATE_HISTORY, { historyAll: data })

export const markHistoryForDeletion = (id) => action(types.MARK_HISTORY_FOR_DELETION, { id: id })

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
          })
        } else {
          dispatch(fetchHistoryFailure(Errors.loan.GENERIC_FETCH_HISTORY_ERROR))
        }
      }).catch(error => dispatch(fetchHistoryFailure(error)))
  }
}

export function updateHistory () {
  return (dispatch, getState) => {
    const { historyData, allLoadedHistory, loadedHistoryItems } = getState().history
    const mergedHistory = merge(allLoadedHistory, historyData, 'id')
    dispatch(requestUpdateHistory(mergedHistory))
    dispatch(setCurrentLoadedNumber(mergedHistory.length))
    if (historyData.length === 0 || mergedHistory.length === loadedHistoryItems) {
      dispatch(setNoHistoryToFetch())
    }
  }
}
