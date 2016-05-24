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

export function reservePublicationSuccess () {
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, { isSuccess: true }))
    dispatch({
      type: types.RESERVE_PUBLICATION_SUCCESS
    })
  }
}

export function reservePublicationFailure (error) {
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, { isError: true, message: error.message }))
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
          dispatch(reservePublicationSuccess())
        } else if (response.status === 403) {
          throw Error(Errors.reservation.TOO_MANY_RESERVES)
        } else {
          throw Error(Errors.reservation.GENERIC_RESERVATION_ERROR)
        }
      })
      .catch(error => dispatch(reservePublicationFailure(error)))
  }
}
