/* eslint-env mocha */
import expect from 'expect'
import modal from '../../src/frontend/reducers/modal'
import * as types from '../../src/frontend/constants/ActionTypes'

describe('reducers', () => {
  describe('modal', () => {
    it('should handle initial state', () => {
      expect(
        modal(undefined, {})
      ).toEqual({
        modalType: null,
        modalProps: {}
      })
    })

    it(`should handle ${types.SHOW_MODAL}`, () => {
      expect(
        modal({}, {
          type: types.SHOW_MODAL,
          payload: {
            modalType: 'test_modal',
            modalProps: 'test_props'
          }
        })
      ).toEqual({
        modalType: 'test_modal',
        modalProps: 'test_props'
      })
    })

    it(`should handle ${types.HIDE_MODAL}`, () => {
      expect(
        modal({}, {
          type: types.HIDE_MODAL
        })
      ).toEqual({
        modalType: null,
        modalProps: {}
      })
    })
  })
})
