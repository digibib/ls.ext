import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'

export function formFilled () {
  return {
    type: types.REGISTRATION_FORM_FILLED
  }
}

export function historySet () {
  return {
    type: types.REGISTRATION_HISTORY_SET
  }
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
  return dispatch => {
    dispatch({
      type: types.REGISTRATION_FAILURE,
      payload: { error: error, message: message },
      error: true
    })
  }
}

export function postRegistrationSuccess (username, password, categoryCode) {
  return dispatch => {
    dispatch({
      type: types.REGISTRATION_SUCCESS,
      payload: {
        isSuccess: true,
        username: username,
        categoryCode: categoryCode
      }
    })
  }
}

export function checkForExistingUser () {
  const url = '/api/v1/checkforexistinguser'
  return (dispatch, getState) => {
    const { registrationPartOne: { values: { firstName, lastName, day, month, year, ssn } } } = getState().form
    const registrationInfo = {
      firstName: firstName,
      lastName: lastName,
      day: day,
      month: month,
      year: year,
      ssn: ssn
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
          dispatch(checkForExistingUserFailure({ error: 'userExistsInLocalDB' }))
        } else if (json.centraldb) {
          dispatch(checkForExistingUserFailure({ error: 'userExistsInCentralDB' }))
        } else if (json.error) {
          dispatch(checkForExistingUserFailure({ error: 'genericRegistrationError' }))
        } else {
          dispatch(checkForExistingUserSuccess())
        }
      })
      .catch(error => {
        console.log('existingUserFailure:', error)
        dispatch(checkForExistingUserFailure(error))
      })
  }
}

export function checkForExistingUserSuccess () {
  return dispatch => {
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
  return { type: types.TOGGLE_SSN_INFO }
}

export function toggleAcceptTerms () {
  return { type: types.TOGGLE_ACCEPT_TERMS }
}

export function postRegistration (successAction) {
  const url = '/api/v1/registration'
  return (dispatch, getState) => {
    const {
      registrationPartOne: { values: { firstName, lastName, day, month, year, ssn } },
      registrationPartTwo: { values: { email, mobile, address, zipcode, city, country, /* gender, */ pin, repeatPin, library, acceptTerms } },
      registrationPartThree: { values: { keepHistory } }
    } = getState().form
    const registrationInfo = {
      firstName: firstName,
      lastName: lastName,
      day: day,
      month: month,
      year: year,
      ssn: ssn,
      email: email,
      mobile: mobile,
      address: address,
      zipcode: zipcode,
      city: city,
      country: country,
      /* gender: gender.value, */
      pin: pin,
      repeatPin: repeatPin,
      library: library,
      acceptTerms: acceptTerms,
      keepHistory: keepHistory
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
        dispatch(postRegistrationSuccess(json.username, registrationInfo.pin, json.categoryCode))
        if (successAction) {
          dispatch(successAction)
        }
      })
      .catch(error => dispatch(postRegistrationFailure(error)))
  }
}
