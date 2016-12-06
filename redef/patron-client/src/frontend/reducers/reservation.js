import {
  REQUEST_RESERVE_PUBLICATION,
  RESERVE_PUBLICATION_FAILURE,
  RESERVE_PUBLICATION_SUCCESS,
  REQUEST_EXTEND_LOAN,
  EXTEND_LOAN_FAILURE,
  EXTEND_LOAN_SUCCESS,
  REQUEST_CANCEL_RESERVATION,
  CANCEL_RESERVATION_FAILURE,
  CANCEL_RESERVATION_SUCCESS,
  REQUEST_CHANGE_PICKUP_LOCATION,
  CHANGE_PICKUP_LOCATION_SUCCESS,
  CHANGE_PICKUP_LOCATION_FAILURE,
  REQUEST_CHANGE_RESERVATION_SUSPENSION,
  CHANGE_RESERVATION_SUSPENSION_SUCCESS,
  CHANGE_RESERVATION_SUSPENSION_FAILURE
} from '../constants/ActionTypes'

const initialState = {
  isRequestingReservation: false,
  reservationError: false,
  isRequestingExtendLoan: false,
  extendLoanError: false,
  isRequestingCancelReservation: false,
  cancelReservationError: false,
  isRequestingChangePickupLocation: false,
  changePickupLocationError: false,
  isRequestingChangeReservationSuspension: false,
  changeReservationSuspensionError: false
}

export default function reservation (state = initialState, action) {
  switch (action.type) {
    case REQUEST_RESERVE_PUBLICATION:
      return { ...state, isRequestingReservation: true, reservationError: false }
    case RESERVE_PUBLICATION_SUCCESS:
      return { ...state, isRequestingReservation: false, reservationError: false }
    case RESERVE_PUBLICATION_FAILURE:
      return { ...state, isRequestingReservation: false, reservationError: action.payload.error }
    case REQUEST_EXTEND_LOAN:
      return { ...state, isRequestingExtendLoan: true, extendLoanError: false }
    case EXTEND_LOAN_SUCCESS:
      return { ...state, isRequestingExtendLoan: false, extendLoanError: false }
    case EXTEND_LOAN_FAILURE:
      return { ...state, isRequestingExtendLoan: false, extendLoanError: action.payload.error }
    case REQUEST_CANCEL_RESERVATION:
      return { ...state, isRequestingCancelReservation: true, cancelReservationError: false }
    case CANCEL_RESERVATION_SUCCESS:
      return { ...state, isRequestingCancelReservation: false, cancelReservationError: false }
    case CANCEL_RESERVATION_FAILURE:
      return { ...state, isRequestingCancelReservation: false, cancelReservationError: action.payload.error }
    case REQUEST_CHANGE_PICKUP_LOCATION:
      return { ...state, isRequestingChangePickupLocation: action.payload.reserveId, changePickupLocationError: false }
    case CHANGE_PICKUP_LOCATION_SUCCESS:
      return { ...state, isRequestingChangePickupLocation: false, changePickupLocationError: false }
    case CHANGE_PICKUP_LOCATION_FAILURE:
      return { ...state, isRequestingChangePickupLocation: false, changePickupLocationError: action.payload.error }
    case REQUEST_CHANGE_RESERVATION_SUSPENSION:
      return { ...state, isRequestingChangeReservationSuspension: action.payload.reserveId, changeReservationSuspensionError: false }
    case CHANGE_RESERVATION_SUSPENSION_SUCCESS:
      return { ...state, isRequestingChangeReservationSuspension: false, changeReservationSuspensionError: false }
    case CHANGE_RESERVATION_SUSPENSION_FAILURE:
      return { ...state, isRequestingChangeReservationSuspension: false, changeReservationSuspensionError: action.payload.error }
    default:
      return state
  }
}
