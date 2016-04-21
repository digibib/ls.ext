import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import Constants from '../constants/Constants'

export function requestTranslation (locale) {
  return {
    type: types.REQUEST_TRANSLATION,
    payload: {
      locale: locale
    }
  }
}

export function translationFailure (error) {
  return {
    type: types.TRANSLATION_FAILURE,
    payload: error,
    error: true
  }
}

export function receiveTranslation (locale, messages) {
  return {
    type: types.RECEIVE_TRANSLATION,
    payload: {
      locale: locale,
      messages: messages
    }
  }
}

export function loadLanguage (locale) {
  return (dispatch, getState) => {
    locale = locale || getState().application.locale
    let uri = `${Constants.backendUri}/translations/${locale}`
    dispatch(requestTranslation(locale))
    return fetch(uri, {
      method: 'GET', headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => dispatch(receiveTranslation(locale, json)))
      .catch(error => dispatch(translationFailure(error)))
  }
}
