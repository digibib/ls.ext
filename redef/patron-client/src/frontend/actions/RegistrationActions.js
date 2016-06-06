import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'
import * as ProfileActions from './ProfileActions'

export function startRegistration () {
  return showModal(ModalComponents.REGISTRATION, {})
}
/*
export function requestRegistration (checkoutId) {
  return {
    type: types.REQUEST_EXTEND_LOAN,
    payload: {
      checkoutId: checkoutId
    }
  }
}

export function registrationSuccess (checkoutId) {
  return dispatch => {
    dispatch(showModal(ModalComponents.EXTEND_LOAN, { isSuccess: true, checkoutId: checkoutId }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.EXTEND_LOAN_SUCCESS,
      payload: {
        checkoutId: checkoutId
      }
    })
  }
}

export function registrationFailure (error, checkoutId) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.EXTEND_LOAN, { isError: true, message: error.message, checkoutId: checkoutId }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.EXTEND_LOAN_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function registration (checkoutId) {
  const url = '/api/v1/checkouts'
  return dispatch => {
    dispatch(requestRegistration(checkoutId))
    return fetch(url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ checkoutId: checkoutId })
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(registrationSuccess(checkoutId))
        } else {
          throw Error(Errors.reservation.GENERIC_EXTEND_LOAN_ERROR)
        }
      })
      .catch(error => dispatch(registrationFailure(error, checkoutId)))
  }
}
*/