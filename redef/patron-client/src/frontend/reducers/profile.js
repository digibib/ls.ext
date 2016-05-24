import {
  REQUEST_PROFILE_INFO,
  RECEIVE_PROFILE_INFO,
  PROFILE_INFO_FAILURE,
  REQUEST_PROFILE_LOANS,
  RECEIVE_PROFILE_LOANS,
  PROFILE_LOANS_FAILURE,
  REQUEST_PROFILE_SETTINGS,
  RECEIVE_PROFILE_SETTINGS,
  PROFILE_SETTINGS_FAILURE
} from '../constants/ActionTypes'

const initialState = {
  isRequestingLoansAndReservations: false,
  loansAndReservationsError: null,
  loansAndReservations: {
    pickups: [],
    loans: [],
    reservations: []
  },
  isRequestingPersonalInformation: false,
  personalInformationError: null,
  personalInformation: {},
  isRequestingSettings: false,
  settingsError: null,
  settings: {}
}

export default function profile (state = initialState, action) {
  switch (action.type) {
    case REQUEST_PROFILE_INFO:
      return { ...state, /* personalInformationError: null, */ isRequestingPersonalInformation: true }
    case RECEIVE_PROFILE_INFO:
      return { ...state, personalInformation: action.payload.info, personalInformationError: null, isRequestingPersonalInformation: false }
    case PROFILE_INFO_FAILURE:
      return { ...state, personalInformationError: action.payload, isRequestingPersonalInformation: false }
    case REQUEST_PROFILE_LOANS:
      return { ...state, /* loansAndReservationsError: null, */ isRequestingLoansAndReservations: true }
    case RECEIVE_PROFILE_LOANS:
      return { ...state, loansAndReservations: action.payload.loans, loansAndReservationsError: null, isRequestingLoansAndReservations: false }
    case PROFILE_LOANS_FAILURE:
      return { ...state, loansAndReservationsError: action.payload, isRequestingLoansAndReservations: false }
    case REQUEST_PROFILE_SETTINGS:
      return { ...state, /* settingsError: null, */ isRequestingSettings: true }
    case RECEIVE_PROFILE_SETTINGS:
      return { ...state, settings: action.payload.settings, settingsError: null, isRequestingSettings: false }
    case PROFILE_SETTINGS_FAILURE:
      return { ...state, settingsError: action.payload, isRequestingSettings: false }
    default:
      return state
  }
}
