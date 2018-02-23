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
        demandCaptcha: false,
        captchaResponse: null,
        isValidatingCaptcha: false,
        borrowerNumber: null,
        isRequestingLogin: false,
        loginError: null,
        isRequestingLogout: false,
        logoutError: null,
        isRequestingLoginStatus: false,
        loginStatusError: null,
        libraries: {},
        isRequestingLibraries: false,
        librariesError: false,
        windowWidth: 0
      })
    })

    it(`should handle ${types.RECEIVE_TRANSLATION}`, () => {
      const messages = { 'testkey': 'testvalue' }
      expect(
        application({
          locale: 'no',
          messages: {
            no: { ...i18n.no }
          }
        }, {
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
        }
      })
    })
  })
})
