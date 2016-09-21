/* eslint-env mocha */
import expect from 'expect'
import resources from '../../src/frontend/reducers/resources'
import * as types from '../../src/frontend/constants/ActionTypes'

describe('reducers', () => {
  describe('resources', () => {
    it('should handle initial state', () => {
      expect(
        resources(undefined, {})
      ).toEqual({
        isRequesting: false,
        resources: {}
      })
    })

    it(`should handle ${types.REQUEST_RESOURCE}`, () => {
      expect(
        resources(undefined, {
          type: types.REQUEST_RESOURCE
        })
      ).toEqual({
        isRequesting: true,
        resources: {}
      })
      expect(
        resources({
          isRequesting: false,
          resources: { 'test': 'value' }
        }, {
          type: types.REQUEST_RESOURCE
        })
      ).toEqual({
        isRequesting: true,
        resources: { 'test': 'value' }
      })
    })

    it(`should handle ${types.RECEIVE_RESOURCE}`, () => {
      expect(
        resources(undefined, {
          type: types.RECEIVE_RESOURCE,
          payload: {
            id: 'test uri',
            resource: 'test resource'
          }
        })
      ).toEqual({
        error: false,
        isRequesting: false,
        resources: { 'test uri': 'test resource' }
      })
      expect(
        resources({
          isRequesting: true,
          resources: { initial: 'value' }
        }, {
          type: types.RECEIVE_RESOURCE,
          payload: {
            id: 'toBeAdded',
            resource: 'value to be added'
          }
        })
      ).toEqual({
        error: false,
        isRequesting: false,
        resources: { initial: 'value', toBeAdded: 'value to be added' }
      })
      expect(
        resources({
          isRequesting: true,
          resources: { 'toBeOverwritten': 'initial' }
        }, {
          type: types.RECEIVE_RESOURCE,
          payload: {
            id: 'toBeOverwritten',
            resource: 'overwritten'
          }
        })
      ).toEqual({
        error: false,
        isRequesting: false,
        resources: { toBeOverwritten: 'overwritten' }
      })
    })
  })
})
