import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'

export function startReservation (recordId) {
  return requireLoginBeforeAction(showModal(ModalComponents.RESERVATION, { recordId: recordId }))
}

export function requestReservePublication () {
  return {
    type: types.REQUEST_RESERVE_PUBLICATION
  }
}

export function reservePublicationSuccess (recordId, branchCode) {
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, { isSuccess: true, recordId: recordId, branchCode: branchCode }))
    dispatch({
      type: types.RESERVE_PUBLICATION_SUCCESS
    })
  }
}

export function reservePublicationFailure (error, recordId, branchCode) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, { isError: true, message: error.message, recordId: recordId, branchCode: branchCode }))
    dispatch({
      type: types.RESERVE_PUBLICATION_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function reservePublication (recordId, branchCode) {
  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestReservePublication())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recordId: recordId, branchCode: branchCode })
    })
      .then(response => {
        if (response.status === 201) {
          dispatch(reservePublicationSuccess(recordId, branchCode))
        } else if (response.status === 403) {
          throw Error(Errors.reservation.TOO_MANY_RESERVES)
        } else {
          throw Error(Errors.reservation.GENERIC_RESERVATION_ERROR)
        }
      })
      .catch(error => dispatch(reservePublicationFailure(error, recordId, branchCode)))
  }
}

export function startExtendLoan (checkoutId) {
  return requireLoginBeforeAction(showModal(ModalComponents.EXTEND_LOAN, { checkoutId: checkoutId }))
}

export function requestExtendLoan () {
  return {
    type: types.REQUEST_EXTEND_LOAN
  }
}

export function extendLoanSuccess (checkoutId) {
  return dispatch => {
    dispatch(showModal(ModalComponents.EXTEND_LOAN, { isSuccess: true, checkoutId: checkoutId }))
    dispatch({
      type: types.EXTEND_LOAN_SUCCESS
    })
  }
}

export function extendLoanFailure (error, checkoutId) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.EXTEND_LOAN, { isError: true, message: error.message, checkoutId: checkoutId }))
    dispatch({
      type: types.EXTEND_LOAN_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function extendLoan (checkoutId) {
  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestExtendLoan())
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
