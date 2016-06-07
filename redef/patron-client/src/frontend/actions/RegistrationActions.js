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

export function postRegistrationFailure (error) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.REGISTRATION, {
      isError: true
    }))
    dispatch({
      type: types.REGISTRATION_FAILURE,
      payload: error,
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

export function postRegistration (successAction) {
  const url = '/api/v1/registration'
  return (dispatch, getState) => {
    const { registration: { firstName, lastName, day, month, year, email, mobile, address, zipcode, city, country, gender, pin, history, library } } = getState().form
    const registrationInfo = {
      firstName: firstName.value,
      lastName: lastName.value,
      day: day.value,
      month: month.value,
      year: year.value,
      email: email.value,
      mobile: mobile.value,
      address: address.value,
      zipcode: zipcode.value,
      city: city.value,
      country: country.value,
      gender: gender.value,
      pin: pin.value,
      history: history.value,
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
        console.log(response.status)
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
