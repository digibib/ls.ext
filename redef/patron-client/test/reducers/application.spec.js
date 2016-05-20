/* eslint-env mocha */
import expect from 'expect'
import application from '../../src/frontend/reducers/application'
import * as types from '../../src/frontend/constants/ActionTypes'
import * as i18n from '../../src/frontend/i18n'

describe('reducers', () => {
  describe('application', () => {
    it('should handle initial state', () => {
      expect(
        application(undefined, {})
      ).toEqual({
        locale: 'no',
        messages: {
          no: { ...i18n.no }
        },
        isLoggedIn: false,
        isRequestingLibraries: false,
        borrowerNumber: null,
        isRequestingLogin: false,
        loginError: null,
        isRequestingLogout: false,
        libraries: [],
        librariesError: false,
        logoutError: null,
        isRequestingLoginStatus: false,
        loginStatusError: null
      })
    })

    it('should handle ' + types.RECEIVE_TRANSLATION, () => {
      let messages = { 'testkey': 'testvalue' }
      expect(
        application(undefined, {
          type: types.RECEIVE_TRANSLATION,
          payload: {
            locale: 'en',
            messages: messages
          }
        })
      ).toEqual({
        locale: 'en',
        messages: {
          no: { ...i18n.no },
          en: messages
        },
        isLoggedIn: false,
        isRequestingLibraries: false,
        borrowerNumber: null,
        isRequestingLogin: false,
        loginError: null,
        isRequestingLogout: false,
        libraries: [],
        librariesError: false,
        logoutError: null,
        isRequestingLoginStatus: false,
        loginStatusError: null
      })
    })
  })
})
