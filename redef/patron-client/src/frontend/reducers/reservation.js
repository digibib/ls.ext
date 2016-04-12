import {
  REQUEST_RESERVE_PUBLICATION,
  RESERVE_PUBLICATION_FAILURE,
  RESERVE_PUBLICATION_SUCCESS
} from '../constants/ActionTypes'

const initialState = {
  isRequestingReservation: false,
  reservationError: false
}

export default function reservation (state = initialState, action) {
  switch (action.type) {
    case REQUEST_RESERVE_PUBLICATION:
      return { isRequestingReservation: true, reservationError: false }
    case RESERVE_PUBLICATION_SUCCESS:
      return initialState
    case RESERVE_PUBLICATION_FAILURE:
      return { isRequestingReservation: false, reservationError: action.payload.error }
    default:
      return state
  }
}
