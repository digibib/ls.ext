import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import Errors from '../constants/Errors'

export function startExtendLoan (checkoutId) {
  return requireLoginBeforeAction(extendLoan(checkoutId))
}

export function startExtendAllLoans (checkouts) {
  return dispatch => {
    requireLoginBeforeAction(dispatch(requestExtendAllLoans()))
    checkouts.forEach(checkout => {
      dispatch(extendLoan(checkout.checkoutId))
    })
  }
}

export function requestExtendLoan (checkoutId) {
  return {
    type: types.REQUEST_EXTEND_LOAN,
    payload: {
      checkoutId: checkoutId
    }
  }
}

export function requestExtendAllLoans () {
  return { type: types.REQUEST_EXTEND_ALL_LOANS }
}

export function extendLoanSuccess (message, checkoutId, newDueDate) {
  return dispatch => {
    dispatch({
      type: types.EXTEND_LOAN_SUCCESS,
      payload: { message: message, checkoutId: checkoutId, newDueDate: newDueDate }
    })
  }
}

export function extendLoanFailure (error, checkoutId) {
  return dispatch => {
    dispatch({
      type: types.EXTEND_LOAN_FAILURE,
      payload: { message: error, checkoutId: checkoutId },
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
        response.json().then(json => dispatch(extendLoanSuccess('genericExtendLoanSuccess', checkoutId, json.newDueDate)))
      } else if (response.status === 403) {
        response.text().then(msg => {
          switch (msg) {
            case 'too_soon': return dispatch(extendLoanFailure(Errors.loan.TOO_SOON_TO_RENEW, checkoutId))
            case 'too_many': return dispatch(extendLoanFailure(Errors.loan.TOO_MANY_RENEWALS, checkoutId))
            case 'on_reserve': return dispatch(extendLoanFailure(Errors.loan.MATERIAL_IS_RESERVED, checkoutId))
            case 'restriction': return dispatch(extendLoanFailure(Errors.loan.PATRON_HAS_RESTRICTION, checkoutId))
            case 'overdue': return dispatch(extendLoanFailure(Errors.loan.PATRON_HAS_OVERDUE, checkoutId))
            default: return dispatch(extendLoanFailure(Errors.loan.GENERIC_EXTEND_LOAN_ERROR, checkoutId))
          }
        })
      } else {
        dispatch(extendLoanFailure(Errors.loan.GENERIC_EXTEND_LOAN_ERROR, checkoutId))
      }
    })
    .catch(error => dispatch(extendLoanFailure(error, checkoutId)))
  }
}
