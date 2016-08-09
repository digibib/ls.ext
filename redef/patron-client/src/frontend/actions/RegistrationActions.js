import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import * as LoginActions from './LoginActions'

export function startRegistration () {
  return showModal(ModalComponents.REGISTRATION, {})
}

export function requestPostRegistration () {
  return {
    type: types.REQUEST_REGISTRATION
  }
}

export function requestCheckForExistingUser () {
  return {
    type: types.REQUEST_CHECK_FOR_EXISTING_USER
  }
}

export function postRegistrationFailure (error, message) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.REGISTRATION, {
      isError: true
    }))
    dispatch({
      type: types.REGISTRATION_FAILURE,
      payload: { error: error, message: message },
      error: true
    })
  }
}

export function postRegistrationSuccess (username, password) {
  return dispatch => {
    dispatch(showModal(ModalComponents.REGISTRATION, { isSuccess: true, username: username }))
    dispatch({ type: types.REGISTRATION_SUCCESS })
    dispatch(LoginActions.login(username, password))
  }
}

export function checkForExistingUser () {
  const url = '/api/v1/checkforexistinguser'
  return (dispatch, getState) => {
    const { registrationPartOne: { firstName, lastName, day, month, year, ssn } } = getState().form
    const registrationInfo = {
      firstName: firstName.value,
      lastName: lastName.value,
      day: day.value,
      month: month.value,
      year: year.value,
      ssn: ssn.value
    }
    dispatch(requestCheckForExistingUser())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationInfo)
    })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        } else if (response.status === 403) {
          return { error: response.json() }
        } else {
          throw Error('Unexpected status code')
        }
      })
      .then(json => {
        if (json.localdb) {
          dispatch(checkForExistingUserFailure({error: 'userExistsInLocalDB'}))
        } else if (json.centraldb) {
          dispatch(checkForExistingUserFailure({error: 'userExistsInCentralDB'}))
        } else if (json.error) {
          dispatch(checkForExistingUserFailure({error: 'genericRegistrationError'}))
        } else {
          dispatch(checkForExistingUserSuccess())
        }
      })
      .catch(error => dispatch(checkForExistingUserFailure(error)))
  }
}

export function checkForExistingUserSuccess () {
  return dispatch => {
    dispatch(showModal(ModalComponents.REGISTRATION, { checkForExistingUser: true }))
    dispatch({ type: types.CHECK_FOR_EXISTING_USER_SUCCESS })
  }
}

export function checkForExistingUserFailure (error) {
  console.log(error)
  return dispatch => {
    dispatch({
      type: types.CHECK_FOR_EXISTING_USER_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function showSSNInfo () {
  return dispatch => {
    dispatch({ type: types.TOGGLE_SSN_INFO })
  }
}

export function postRegistration (successAction) {
  const url = '/api/v1/registration'
  return (dispatch, getState) => {
    const {
      registrationPartOne: { firstName, lastName, day, month, year, ssn },
      registrationPartTwo: { email, mobile, address, zipcode, city, country, /* gender, */ pin, repeatPin, library }
    } = getState().form
    const registrationInfo = {
      firstName: firstName.value,
      lastName: lastName.value,
      day: day.value,
      month: month.value,
      year: year.value,
      ssn: ssn.value,
      email: email.value,
      mobile: mobile.value,
      address: address.value,
      zipcode: zipcode.value,
      city: city.value,
      country: country.value,
      /* gender: gender.value, */
      pin: pin.value,
      repeatPin: repeatPin.value,
      library: library.value
    }
    dispatch(requestPostRegistration())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationInfo)
    })
      .then(response => {
        if (response.status === 201) {
          return response.json()
        } else {
          throw Error('Unexpected status code')
        }
      })
      .then(json => {
        dispatch(postRegistrationSuccess(json.username, registrationInfo.pin))
        if (successAction) {
          dispatch(successAction)
        }
      })
      .catch(error => dispatch(postRegistrationFailure(error)))
  }
}
