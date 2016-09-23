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
  console.log(error)
  return {
    type: types.TRANSLATION_FAILURE,
    payload: error,
    error: true
  }
}

export function receiveTranslation (locale, messages, fromStorage) {
  if (process.env.NODE_ENV !== 'server' && sessionStorage && !fromStorage) {
    const translations = {}
    translations[ locale ] = messages
    sessionStorage.setItem('translations', JSON.stringify(translations))
  }
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
    const url = `${Constants.backendUri}/translations/${locale}`
    dispatch(requestTranslation(locale))
    if (process.env.NODE_ENV !== 'server' &&
      sessionStorage &&
      sessionStorage.translations &&
      JSON.parse(sessionStorage.translations)[ locale ]) {
      return dispatch(receiveTranslation(locale, JSON.parse(sessionStorage.translations)[ locale ], true))
    } else {
      return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(response => response.json())
        .then(json => dispatch(receiveTranslation(locale, json)))
        .catch(error => dispatch(translationFailure(error)))
    }
  }
}
