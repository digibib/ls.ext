import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import { fetchProfileLoans } from './ProfileActions'
import Errors from '../constants/Errors'

export function startExtendLoan (checkoutId) {
  return requireLoginBeforeAction(extendLoan(checkoutId))
}

export function startExtendAllLoans (checkouts) {
  return dispatch => {
    requireLoginBeforeAction(dispatch(requestExtendAllLoans()))
    checkouts.forEach(checkout => {
      dispatch(extendLoan(checkout.id))
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

export function requestStartPayFine (fineId) {
  return {
    type: types.REQUEST_START_PAY_FINE,
    payload: {
      fineId: fineId
    }
  }
}

export function startPayFineSuccess (fineId, transactionId, merchantId, terminalUrl) {
  return dispatch => {
    const url = `${terminalUrl}?merchantId=${merchantId}&transactionId=${transactionId}`
    dispatch({
      type: types.START_PAY_FINE_SUCCESS
    })
    window.location = url
  }
}

export function startPayFineFailure (fineId, error) {
  return dispatch => {
    dispatch({
      type: types.START_PAY_FINE_FAILURE,
      payload: { message: error, fineId: fineId },
      error: true
    })
  }
}

export function startPayFine (fineId, location) {
  const url = '/api/v1/checkouts/start-pay-fine'
  return dispatch => {
    dispatch(requestStartPayFine(fineId))
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fineId: fineId, origin: location })
    })
    .then(response => {
      if (response.status === 200) {
        response.json().then(json => {
          dispatch(startPayFineSuccess(fineId, json.transactionId, json.merchantId, json.terminalUrl))
        })
      } else {
        dispatch(startPayFineFailure(fineId))
      }
    })
    .catch(error => dispatch(startPayFineFailure(fineId, error)))
  }
}

export function startProcessFinePayment (transactionId) {
  return dispatch => {
    dispatch({
      type: types.REQUEST_START_PROCESS_PAYMENT,
      payload: {
        transactionId: transactionId
      }
    })
  }
}

export function processFinePaymentSuccess (transactionId, responseCode, authorizationId, batchNumber, successfulExtends, failedExtends) {
  return dispatch => {
    dispatch({
      type: types.PAYMENT_SUCCESS,
      payload: {
        transactionId: transactionId,
        responseCode: responseCode,
        authorizationId: authorizationId,
        batchNumber: batchNumber,
        successfulExtends: successfulExtends,
        failedExtends: failedExtends
      }
    })
  }
}

export function processFinePaymentFailure (transactionId, error) {
  return dispatch => {
    dispatch({
      type: types.PROCESS_PAYMENT_FAILURE,
      payload: { message: error, transactionId: transactionId },
      error: true
    })
  }
}

export function processFinePayment (transactionId) {
  const url = '/api/v1/checkouts/process-fine-payment'
  return dispatch => {
    dispatch(startProcessFinePayment(transactionId))
    return fetch(url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionId: transactionId })
    })
    .then(response => {
      if (response.status === 200) {
        response.json().then(json => {
          dispatch(fetchProfileLoans())
          dispatch(processFinePaymentSuccess(json.transactionId, json.responseCode, json.authorizationId, json.batchNumber, json.successfulExtends, json.failedExtends))
        })
      } else {
        dispatch(processFinePaymentFailure(transactionId))
      }
    })
  }
}
