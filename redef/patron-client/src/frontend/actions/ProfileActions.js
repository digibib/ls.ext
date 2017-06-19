import fetch from 'isomorphic-fetch'

import { requireLoginBeforeAction } from './LoginActions'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import * as types from '../constants/ActionTypes'
import Errors from '../constants/Errors'
import { action, errorAction } from './GenericActions'

export const requestProfileSettings = () => action(types.REQUEST_PROFILE_SETTINGS)

export const profileSettingsFailure = (error) => errorAction(types.PROFILE_SETTINGS_FAILURE, error)

export const receiveProfileSettings = (settings) => action(types.RECEIVE_PROFILE_SETTINGS, { settings })

export function fetchProfileSettings () {
  return (dispatch) => {
    const url = '/api/v1/profile/settings'
    dispatch(requestProfileSettings())
    return fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
      }
    })
      .then(response => response.json())
      .then(json => dispatch(receiveProfileSettings(json)))
      .catch(error => dispatch(profileSettingsFailure(error)))
  }
}

export const requestProfileLoans = () => action(types.REQUEST_PROFILE_LOANS)

export const profileLoansFailure = (error) => errorAction(types.PROFILE_LOANS_FAILURE, error)

export const receiveProfileLoans = (loans) => action(types.RECEIVE_PROFILE_LOANS, { loans })

export function fetchProfileLoans () {
  return (dispatch) => {
    const url = '/api/v1/profile/loans'
    dispatch(requestProfileLoans())
    return fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
      }
    })
      .then(response => response.json())
      .then(json => dispatch(receiveProfileLoans(json)))
      .catch(error => dispatch(profileLoansFailure(error)))
  }
}

export const requestProfileInfo = () => action(types.REQUEST_PROFILE_INFO)

export const profileInfoFailure = (error) => errorAction(types.PROFILE_INFO_FAILURE, error)

export const receiveProfileInfo = (info) => action(types.RECEIVE_PROFILE_INFO, { info })

export function fetchProfileInfo () {
  return (dispatch) => {
    const url = '/api/v1/profile/info'
    dispatch(requestProfileInfo())
    return fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
      }
    })
      .then(response => response.json())
      .then(json => dispatch(receiveProfileInfo(json)))
      .catch(error => dispatch(profileInfoFailure(error)))
  }
}

export const requestPostProfileInfo = () => action(types.REQUEST_POST_PROFILE_INFO)

export const postProfileInfoFailure = (error) => errorAction(types.POST_PROFILE_INFO_FAILURE, error)

export const postProfileInfoSuccess = () => action(types.POST_PROFILE_INFO_SUCCESS)

export function postProfileInfo (successAction) {
  const url = '/api/v1/profile/info'
  return (dispatch, getState) => {
    const { userInfo: { values: { address, zipcode, city, country, mobile, email, telephone } } } = getState().form
    const profileInfo = {
      address: address,
      zipcode: zipcode,
      city: city,
      country: country,
      mobile: mobile,
      email: email,
      telephone: telephone
    }
    dispatch(requestPostProfileInfo())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileInfo)
    })
      .then(response => {
        if (response.status === 200 || response.status === 204) {
          dispatch(postProfileInfoSuccess())
          dispatch(fetchProfileInfo())
          if (successAction) {
            dispatch(successAction)
          }
        } else {
          throw Error('Unexpected status code')
        }
      })
      .catch(error => dispatch(postProfileInfoFailure(error)))
  }
}

export const contactDetailsNeedVerification = () => action(types.CONTACT_DETAILS_NEED_VERIFICATION)
export const requestPostContactDetails = () => action(types.REQUEST_POST_CONTACT_DETAILS)
export const changeContactDetailsFailure = (error) => errorAction(types.CHANGE_CONTACT_DETAILS_FAILURE, error)
export const changeContactDetailsSuccess = () => action(types.CHANGE_CONTACT_DETAILS_SUCCESS)

export function postContactDetailsFromForm (successAction) {
  return (dispatch, getState) => {
    const { contactDetails: { values: { mobile, email } } } = getState().form
    dispatch(postContactDetails(mobile, email, successAction))
  }
}

export function postContactDetails (mobile, email, successAction) {
  const url = '/api/v1/profile/contactdetails'
  return (dispatch) => {
    dispatch(requestPostContactDetails())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({mobile: mobile, email: email})
    })
      .then(response => {
        if (response.status === 200 || response.status === 204) {
          dispatch(changeContactDetailsSuccess())
          dispatch(fetchProfileInfo())
          if (successAction) {
            dispatch(successAction)
          }
        } else {
          throw Error('Unexpected status code')
        }
      })
      .catch(error => dispatch(changeContactDetailsFailure(error)))
  }
}

export const requestPostProfileSettings = () => action(types.REQUEST_POST_PROFILE_SETTINGS)

export const postProfileSettingsFailure = (error) => errorAction(types.POST_PROFILE_SETTINGS_FAILURE, error)

export const postProfileSettingsSuccess = () => action(types.POST_PROFILE_SETTINGS_SUCCESS)

export const resetProfileSettingsSuccess = () => action(types.RESET_PROFILE_SETTINGS_SUCCESS)

export function postProfileSettings (profileSettings, successAction) {
  const url = '/api/v1/profile/settings'
  return dispatch => {
    dispatch(requestPostProfileSettings())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileSettings)
    })
      .then(response => {
        if (response.status === 200 || response.status === 204) {
          return response.json()
        } else {
          throw Error('Unexpected status code')
        }
      })
      .then(json => {
        dispatch(postProfileSettingsSuccess())
        dispatch(receiveProfileSettings(json))
        if (successAction) {
          dispatch(successAction)
        }
      })
      .catch(error => dispatch(postProfileSettingsFailure(error)))
  }
}

export const requestChangePassword = () => action(types.REQUEST_CHANGE_PASSWORD)

export const changePasswordFailure = (error) => errorAction(types.CHANGE_PASSWORD_FAILURE, error)

export const changePasswordSuccess = () => action(types.CHANGE_PASSWORD_SUCCESS)

export function changePasswordFromForm (successAction) {
  return (dispatch, getState) => {
    const { changePin: { values: { currentPin, newPin } } } = getState().form
    dispatch(changePassword(currentPin, newPin, successAction))
  }
}

export function changePassword (currentPassword, newPassword, successAction) {
  const url = '/api/v1/profile/settings/password'
  return dispatch => {
    dispatch(requestChangePassword())
    return fetch(url, {
      method: 'put',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(changePasswordSuccess())
          if (successAction) {
            dispatch(successAction)
          }
        } else if (response.status === 403) {
          throw Error(Errors.profile.CURRENT_PIN_NOT_CORRRECT)
        } else {
          throw Error(Errors.profile.GENERIC_CHANGE_PIN_ERROR)
        }
      })
      .catch(error => dispatch(changePasswordFailure(error)))
  }
}

export function fetchAllProfileData () {
  return dispatch => {
    dispatch(fetchProfileInfo())
    dispatch(fetchProfileLoans())
    dispatch(fetchProfileSettings())
  }
}

export const requestManageHistory = () => action(types.REQUEST_MANAGE_HISTORY)

export const manageHistoryFailure = (error) => errorAction(types.MANAGE_HISTORY_FAILURE, error)

export const changeHistoryPrivacy = (privacy) => action(types.CHANGE_HISTORY_PRIVACY, {privacy: privacy})

export function userHistory () {
  return requireLoginBeforeAction(showModal(ModalComponents.USER_HISTORY, { isSuccess: true} ))
}

export function manageHistory (privacy) {
  const url = '/api/v1/profile/settings/history'
  return dispatch => {
    dispatch(requestManageHistory())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ privacy: privacy })
    })
      .then(response => {
        if (response.status === 200) {
          // dispatch(changeHistoryPrivacy(privacy))
          dispatch(fetchProfileInfo())
        } else {
          throw Error('Unexpected status code')
        }
      })
      .catch(error => dispatch(manageHistoryFailure(error)))
  }
}
