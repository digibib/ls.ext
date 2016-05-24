import fetch from 'isomorphic-fetch'

import * as types from '../constants/ActionTypes'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'

export function requestLogin (username) {
  return {
    type: types.REQUEST_LOGIN,
    payload: {
      username: username
    }
  }
}

export function loginSuccess (username, borrowerNumber) {
  return {
    type: types.LOGIN_SUCCESS,
    payload: {
      username: username,
      borrowerNumber: borrowerNumber
    }
  }
}

export function loginFailure (username, error) {
  console.log(error)
  return {
    type: types.LOGIN_FAILURE,
    payload: {
      username: username,
      message: error.message
    },
    error: true
  }
}

export function showLoginDialog (successAction) {
  return (dispatch, getState) => {
    if (getState().application.isLoggedIn) {
      dispatch(successAction)
    } else {
      dispatch({ type: types.SHOW_LOGIN_DIALOG })
      dispatch(showModal(ModalComponents.LOGIN, { successAction: successAction }))
    }
  }
}

export function login (username, password, successActions = []) {
  const url = '/login'
  return dispatch => {
    dispatch(requestLogin(username))
    return fetch(url, {
      method: 'POST', headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ username: username, password: password })
    })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        } else if (response.status === 403) {
          throw Error(Errors.login.INVALID_CREDENTIALS)
        } else {
          throw Error(Errors.login.GENERIC_LOGIN_ERROR)
        }
      })
      .then(json => {
        dispatch(loginSuccess(username, json.borrowerNumber))
        successActions.forEach(successAction => dispatch(successAction))
      })
      .catch(error => dispatch(loginFailure(username, error)))
  }
}

export function requestLogout () {
  return {
    type: types.REQUEST_LOGOUT
  }
}

export function logoutSuccess () {
  return {
    type: types.LOGOUT_SUCCESS
  }
}

export function logoutFailure (error) {
  console.log(error)
  return {
    type: types.LOGOUT_FAILURE,
    payload: error,
    error: true
  }
}

export function logout () {
  const url = '/logout'
  return dispatch => {
    dispatch(requestLogout())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(logoutSuccess())
        } else {
          dispatch(updateLoginStatus())
        }
      }).catch(message => dispatch(logoutFailure(message)))
  }
}

export function requestLoginStatus () {
  return {
    type: types.REQUEST_LOGIN_STATUS
  }
}

export function receiveLoginStatus (isLoggedIn, borrowerNumber) {
  return {
    type: types.RECEIVE_LOGIN_STATUS,
    payload: {
      isLoggedIn: isLoggedIn,
      borrowerNumber: borrowerNumber
    }
  }
}

export function loginStatusFailure (error) {
  console.log(error)
  return {
    type: types.LOGIN_STATUS_FAILURE,
    payload: error,
    error: true
  }
}

export function updateLoginStatus () {
  const url = '/loginStatus'
  return dispatch => {
    dispatch(requestLoginStatus())
    return fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache'
      },
      credentials: 'same-origin'
    }).then(response => response.json())
      .then(json => dispatch(receiveLoginStatus(json.isLoggedIn, json.borrowerNumber)))
      .catch(error => dispatch(loginStatusFailure(error)))
  }
}

export function requireLoginBeforeAction (successAction) {
  return updateLoginStatusBeforeAction(showLoginDialog(successAction))
}

export function updateLoginStatusBeforeAction (successAction) {
  const url = '/loginStatus'
  return dispatch => {
    dispatch(requestLoginStatus())
    return fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache'
      },
      credentials: 'same-origin'
    }).then(response => response.json())
      .then(json => {
        dispatch(receiveLoginStatus(json.isLoggedIn, json.borrowerNumber))
        dispatch(successAction)
      })
      .catch(error => dispatch(loginStatusFailure(error)))
  }
}
