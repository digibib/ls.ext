/* eslint-env mocha */
import expect from 'expect'
import reservation from '../../src/frontend/reducers/reservation'
import * as types from '../../src/frontend/constants/ActionTypes'

describe('reducers', () => {
  describe('reservation', () => {
    it('should handle initial state', () => {
      expect(
        reservation(undefined, {})
      ).toEqual({
        isRequestingReservation: false,
        reservationError: false,
        changePickupLocationError: false,
        isRequestingExtendLoan: false,
        extendLoanError: false,
        changeReservationSuspensionError: false,
        isRequestingCancelReservation: false,
        isRequestingChangeReservationSuspension: false,
        cancelReservationError: false,
        isRequestingChangePickupLocation: false,
        pickupLocation: null

      })
    })

    it(`should handle ${types.REQUEST_RESERVE_PUBLICATION}`, () => {
      expect(
        reservation({}, {
          type: types.REQUEST_RESERVE_PUBLICATION
        })
      ).toEqual({
        isRequestingReservation: true,
        reservationError: false
      })
    })

    it(`should handle ${types.RESERVE_PUBLICATION_SUCCESS}`, () => {
      expect(
        reservation({}, {
          type: types.RESERVE_PUBLICATION_SUCCESS,
          payload: {
            branchCode: 'pickupBranch'
          }
        })
      ).toEqual({
        isRequestingReservation: false,
        reservationError: false,
        pickupLocation: 'pickupBranch'
      })
    })

    it(`should handle ${types.RESERVE_PUBLICATION_FAILURE}`, () => {
      expect(
        reservation({}, {
          type: types.RESERVE_PUBLICATION_FAILURE,
          payload: {
            error: 'message'
          },
          error: true
        })
      ).toEqual({
        isRequestingReservation: false,
        reservationError: 'message'
      })
    })

    it(`should handle ${types.REQUEST_EXTEND_LOAN}`, () => {
      expect(
        reservation({}, {
          type: types.REQUEST_EXTEND_LOAN
        })
      ).toEqual({
        isRequestingExtendLoan: true,
        extendLoanError: false
      })
    })

    it(`should handle ${types.EXTEND_LOAN_SUCCESS}`, () => {
      expect(
        reservation({}, {
          type: types.EXTEND_LOAN_SUCCESS
        })
      ).toEqual({
        isRequestingExtendLoan: false,
        extendLoanError: false
      })
    })

    it(`should handle ${types.EXTEND_LOAN_FAILURE}`, () => {
      expect(
        reservation({}, {
          type: types.EXTEND_LOAN_FAILURE,
          payload: {
            error: 'message'
          },
          error: true
        })
      ).toEqual({
        isRequestingExtendLoan: false,
        extendLoanError: 'message'
      })
    })

    it(`should handle ${types.CHANGE_PICKUP_LOCATION_SUCCESS}`, () => {
      expect(
        reservation({}, {
          type: types.CHANGE_PICKUP_LOCATION_SUCCESS,
          payload: {
            branchCode: 'testBranch'
          },
          error: true
        })
      ).toEqual({
        isRequestingChangePickupLocation: false,
        changePickupLocationError: false,
        pickupLocation: 'testBranch'
      })
    })
  })
})
