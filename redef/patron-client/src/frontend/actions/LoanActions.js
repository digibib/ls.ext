import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'
import * as ProfileActions from './ProfileActions'

export function startExtendLoan (checkoutId) {
  return requireLoginBeforeAction(showModal(ModalComponents.EXTEND_LOAN, { checkoutId: checkoutId }))
}

export function requestExtendLoan (checkoutId) {
  return {
    type: types.REQUEST_EXTEND_LOAN,
    payload: {
      checkoutId: checkoutId
    }
  }
}

export function extendLoanSuccess (checkoutId) {
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

export function extendLoanFailure (error, checkoutId) {
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

export function extendLoan (checkoutId) {
  const url = '/api/v1/checkouts'
  return dispatch => {
    dispatch(requestExtendLoan(checkoutId))
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
          dispatch(extendLoanSuccess(checkoutId))
        } else {
          throw Error(Errors.reservation.GENERIC_EXTEND_LOAN_ERROR)
        }
      })
      .catch(error => dispatch(extendLoanFailure(error, checkoutId)))
  }
}
