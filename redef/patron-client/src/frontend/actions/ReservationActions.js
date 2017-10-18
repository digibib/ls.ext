import fetch from 'isomorphic-fetch'
import moment from 'moment'

import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'
import * as ProfileActions from './ProfileActions'
import { action, errorAction } from './GenericActions'

export function changePickupLocation (reserveId, branchCode) {
  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestChangePickupLocation(reserveId, branchCode))
    return fetch(url, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reserveId, branchCode })
    })
      .then(response => {
        if (response.status === 200) {
          setTimeout(() => {
            dispatch(changePickupLocationSuccess(reserveId, branchCode))
          }, 500)
        } else {
          throw Error(Errors.reservation.GENERIC_CHANGE_PICKUP_LOCATION_ERROR)
        }
      })
      .catch(error => dispatch(changePickupLocationFailure(error)))
  }
}

export const requestChangePickupLocation = (reserveId, branchCode) => action(types.REQUEST_CHANGE_PICKUP_LOCATION, {
  reserveId,
  branchCode
})

export const changePickupLocationSuccess = (reserveId, branchCode) => action(types.CHANGE_PICKUP_LOCATION_SUCCESS, {
  reserveId,
  branchCode
})

export const changePickupLocationFailure = error => errorAction(types.CHANGE_PICKUP_LOCATION_FAILURE, error)

export function suspendReservation (reserveId, suspended) {
  return dispatch => {
    if (suspended) {
      return dispatch(showModal(ModalComponents.POSTPONE_RESERVATION, { isSuccess: true, reserveId: reserveId, suspended: suspended }))
    }
    return dispatch(changeReservationSuspension(reserveId, suspended))
  }
}

export function changeReservationSuspension (reserveId, suspended, date) {
  let suspendUntil

  if (date) {
    suspendUntil = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
  } else {
    suspendUntil = null
  }

  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestChangeReservationSuspension(reserveId, suspended, suspendUntil))
    return fetch(url, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reserveId, suspended, suspendUntil })
    })
      .then(response => {
        if (response.status === 200) {
          setTimeout(() => {
            dispatch(changeReservationSuspensionSuccess(reserveId, suspended, suspendUntil))
          }, 500)
        } else {
          throw Error(Errors.reservation.GENERIC_CHANGE_RESERVATION_SUSPENSION_ERROR)
        }
      })
      .catch(error => dispatch(changeReservationSuspensionFailure(error)))
  }
}

export const requestChangeReservationSuspension = (reserveId, suspended, suspendUntil) => action(types.REQUEST_CHANGE_RESERVATION_SUSPENSION, {
  reserveId,
  suspended,
  suspendUntil
})

export const changeReservationSuspensionSuccess = (reserveId, suspended, suspendUntil) => action(types.CHANGE_RESERVATION_SUSPENSION_SUCCESS, {
  reserveId,
  suspended,
  suspendUntil
})

export const changeReservationSuspensionFailure = error => errorAction(types.CHANGE_PICKUP_LOCATION_FAILURE, error)

export function startReservation (publication) {
  return requireLoginBeforeAction(chooseReservationDialogue(publication))
}

export function chooseReservationDialogue (publication) {
  return (dispatch, getState) => {
    dispatch({ type: types.REQUEST_RESERVATION_DIALOGUE })
    const profile = getState().profile
    if (profile.category === "IL") { // remote libraries with categorycode IL are remote libraries
      dispatch(showModal(ModalComponents.REMOTE_RESERVATION, { publication: publication }))
    } else {
      dispatch(showModal(ModalComponents.RESERVATION, { publication: publication }))
    }
  }
}


export function requestReservePublication (recordId, branchCode) {
  return {
    type: types.REQUEST_RESERVE_PUBLICATION,
    payload: {
      recordId: recordId,
      branchCode: branchCode
    }
  }
}

export function reservePublicationSuccess (recordId, branchCode) {
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, { isSuccess: true, recordId: recordId, branchCode: branchCode }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.RESERVE_PUBLICATION_SUCCESS,
      payload: {
        recordId: recordId,
        branchCode: branchCode
      }
    })
  }
}

export function reservePublicationFailure (error, recordId, branchCode) {
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, {
      isError: true,
      message: error.message,
      recordId: recordId,
      branchCode: branchCode
    }))
    dispatch(ProfileActions.fetchProfileLoans())
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
    dispatch(requestReservePublication(recordId, branchCode))
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
          return response.json()
        } else {
          throw Error(Errors.reservation.GENERIC_RESERVATION_ERROR)
        }
      })
      .then(maybeError => {
        if (!maybeError) {
          // reservation was succesfull
          return
        }
        if (maybeError.error && maybeError.error.includes('ageRestricted')) {
          throw Error(Errors.reservation.AGE_RESTRICTION)
        } else {
          console.log(`unmatched hold error reason: ${maybeError.error}`)
          throw Error(Errors.reservation.TOO_MANY_RESERVES)
        }
      })
      .catch(error => dispatch(reservePublicationFailure(error, recordId, branchCode)))
  }
}

export function startCancelReservation (reserveId) {
  return requireLoginBeforeAction(showModal(ModalComponents.CANCEL_RESERVATION, { reserveId: reserveId }))
}

export function requestCancelReservation (reserveId) {
  return {
    type: types.REQUEST_CANCEL_RESERVATION,
    payload: {
      reserveId: reserveId
    }
  }
}

export function cancelReservationSuccess (reserveId) {
  return dispatch => {
    dispatch(showModal(ModalComponents.CANCEL_RESERVATION, { isSuccess: true, reserveId: reserveId }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.CANCEL_RESERVATION_SUCCESS,
      payload: {
        reserveId: reserveId
      }
    })
  }
}

export function cancelReservationFailure (error, reserveId) {
  return dispatch => {
    dispatch(showModal(ModalComponents.CANCEL_RESERVATION, {
      isError: true,
      message: error.message,
      reserveId: reserveId
    }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.CANCEL_RESERVATION_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function cancelReservation (reserveId) {
  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestCancelReservation(reserveId))
    return fetch(url, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reserveId: reserveId })
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(cancelReservationSuccess(reserveId))
        } else {
          throw Error(Errors.reservation.GENERIC_CANCEL_RESERVATION_ERROR)
        }
      })
      .catch(error => dispatch(cancelReservationFailure(error, reserveId)))
  }
}

export function requestRemoteReservePublication (recordId, userId, reservationComment) {
  return {
    type: types.REQUEST_REMOTE_RESERVE_PUBLICATION,
    payload: {
      recordId: recordId,
      userId: userId,
      reservationComment: reservationComment
    }
  }
}

export function remoteReservePublicationSuccess (recordId, userId) {
  // TODO: what to do if success? go to loans page?
  return dispatch => {
    dispatch(showModal(ModalComponents.REMOTE_RESERVATION, { isSuccess: true, recordId: recordId, userId: userId }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.REMOTE_RESERVE_PUBLICATION_SUCCESS,
      payload: {
        recordId: recordId,
        userId: userId
      }
    })
  }
}

export function remoteReservePublicationFailure (error, recordId, userId) {
  // TODO: what to do if failure?
  return dispatch => {
    dispatch(showModal(ModalComponents.REMOTE_RESERVATION, {
      isError: true,
      message: error.message,
      recordId: recordId,
      userId: userId
    }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.REMOTE_RESERVE_PUBLICATION_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function remoteReservePublication (recordId, userId, reservationComment) {
  const url = '/api/v1/illrequests'
  return dispatch => {
    dispatch(requestRemoteReservePublication(recordId, userId, reservationComment))
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recordId: recordId, userId: userId, reservationComment: reservationComment })
    })
    .then(response => {
      if (response.status === 201) {
        return dispatch(remoteReservePublicationSuccess(recordId, userId))
      } else if (response.status === 400) {
        return response.json().then(err => {
          // TODO: handler various errors from a 400 response?
          console.log(err)
          throw Error(Errors.reservation.GENERIC_RESERVATION_ERROR)
        })
      } else {
        throw Error(Errors.reservation.GENERIC_RESERVATION_ERROR)
      }
    })
    .catch(error => dispatch(remoteReservePublicationFailure(error, recordId, userId)))
  }
}
