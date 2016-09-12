import { LOCATION_CHANGE } from 'react-router-redux'

import {
  REQUEST_PROFILE_INFO,
  RECEIVE_PROFILE_INFO,
  PROFILE_INFO_FAILURE,
  REQUEST_PROFILE_LOANS,
  RECEIVE_PROFILE_LOANS,
  PROFILE_LOANS_FAILURE,
  REQUEST_PROFILE_SETTINGS,
  RECEIVE_PROFILE_SETTINGS,
  PROFILE_SETTINGS_FAILURE,
  REQUEST_CHANGE_PASSWORD,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  REQUEST_CHANGE_HISTORY_SETTING,
  CHANGE_HISTORY_SETTING_SUCCESS,
  CHANGE_HISTORY_SETTING_FAILURE,
  REQUEST_HISTORY_SETTING,
  RECEIVE_HISTORY_SETTING,
  HISTORY_SETTING_FAILURE

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
  settings: {},
  isRequestingChangePassword: false,
  changePasswordError: null,
  changePasswordSuccess: false,
  isRequestingHistorySetting: false,
  history: null,
  historySettingSuccess: false,
  isRequestingChangeHistorySetting: false,
  changeHistorySettingError: null,
  changeHistorySettingSuccess: false
}

export default function profile (state = initialState, action) {
  switch (action.type) {
    case REQUEST_PROFILE_INFO:
      return { ...state, /* personalInformationError: null, */ isRequestingPersonalInformation: true }
    case RECEIVE_PROFILE_INFO:
      return {
        ...state,
        personalInformation: action.payload.info,
        personalInformationError: null,
        isRequestingPersonalInformation: false
      }
    case PROFILE_INFO_FAILURE:
      return { ...state, personalInformationError: action.payload, isRequestingPersonalInformation: false }
    case REQUEST_PROFILE_LOANS:
      return { ...state, /* loansAndReservationsError: null, */ isRequestingLoansAndReservations: true }
    case RECEIVE_PROFILE_LOANS:
      return {
        ...state,
        loansAndReservations: action.payload.loans,
        loansAndReservationsError: null,
        isRequestingLoansAndReservations: false
      }
    case PROFILE_LOANS_FAILURE:
      return { ...state, loansAndReservationsError: action.payload, isRequestingLoansAndReservations: false }
    case REQUEST_PROFILE_SETTINGS:
      return { ...state, /* settingsError: null, */ isRequestingSettings: true }
    case RECEIVE_PROFILE_SETTINGS:
      return { ...state, settings: action.payload.settings, settingsError: null, isRequestingSettings: false }
    case PROFILE_SETTINGS_FAILURE:
      return { ...state, settingsError: action.payload, isRequestingSettings: false }
    case REQUEST_CHANGE_PASSWORD:
      return {
        ...state, /* changePasswordError: null, */
        isRequestingChangePassword: true,
        changePasswordSuccess: false
      }
    case CHANGE_PASSWORD_SUCCESS:
      return { ...state, changePasswordError: null, isRequestingChangePassword: false, changePasswordSuccess: true }
    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        changePasswordError: action.payload,
        isRequestingChangePassword: false,
        changePasswordSuccess: false
      }
    case REQUEST_CHANGE_HISTORY_SETTING:
      return {
        ...state, /* changeHistorySettingError: null, */
        isRequestingChangeHistorySetting: true,
        changeHistorySettingSuccess: false
      }
    case CHANGE_HISTORY_SETTING_SUCCESS:
      return {
        ...state,
        changeHistorySettingError: null,
        isRequestingChangeHistorySetting: false,
        changeHistorySettingSuccess: true
      }
    case CHANGE_HISTORY_SETTING_FAILURE:
      return {
        ...state,
        changeHistorySettingError: action.payload,
        isRequestingChangeHistorySetting: false,
        changeHistorySettingSuccess: false
      }
    case REQUEST_HISTORY_SETTING:
      return {
        ...state, /* historySettingError: null, */
        isRequestingHistorySetting: true,
      }
    case RECEIVE_HISTORY_SETTING:
      return {
        ...state,
        historySettingError: null,
        isRequestingHistorySetting: false,
        history: action.payload.history
      }
    case HISTORY_SETTING_FAILURE:
      return {
        ...state,
        historySettingError: action.payload,
        isRequestingHistorySetting: false,
      }
    case LOCATION_CHANGE:
      return {
        ...state,
        loansAndReservationsError: null,
        personalInformationError: null,
        settingsError: null,
        changePasswordError: null,
        changePasswordSuccess: false
      }
    default:
      return state
  }
}
