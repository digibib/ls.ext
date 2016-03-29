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
        }
      })
    })

    it('should handle ' + types.CHANGE_LANGUAGE, () => {
      expect(
        application({}, {
          type: types.CHANGE_LANGUAGE,
          payload: {
            locale: 'en'
          }
        })
      ).toEqual({
        locale: 'en'
      })
    })
  })
})