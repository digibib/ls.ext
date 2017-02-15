/* eslint-env mocha */
import expect from 'expect'
import loan from '../../src/frontend/reducers/loan'
import * as types from '../../src/frontend/constants/ActionTypes'

describe('reducers', () => {
  describe('loan', () => {
    it('should handle initial state', () => {
      expect(
        loan(undefined, {})
      ).toEqual({
        isRequestingExtendLoan: false,
        isRequestingExtendAllLoans: false,
        extendLoanError: false,
        hasRequestedRenewAll: false
      })
    })

    it(`should handle ${types.REQUEST_EXTEND_ALL_LOANS}`, () => {
      expect(
        loan({}, {
          type: types.REQUEST_EXTEND_ALL_LOANS
        })
      ).toEqual({
        extendLoanError: false,
        isRequestingExtendAllLoans: true,
        hasRequestedRenewAll: true
      })
    })

    it(`should handle ${types.REQUEST_EXTEND_LOAN}`, () => {
      expect(
        loan({}, {
          type: types.REQUEST_EXTEND_LOAN
        })
      ).toEqual({
        isRequestingExtendLoan: true,
        extendLoanError: false
      })
    })

    it(`should handle ${types.EXTEND_LOAN_SUCCESS}`, () => {
      expect(
        loan({}, {
          type: types.EXTEND_LOAN_SUCCESS
        })
      ).toEqual({
        isRequestingExtendLoan: false,
        extendLoanError: false
      })
    })

    it(`should handle ${types.EXTEND_LOAN_FAILURE}`, () => {
      expect(
        loan({}, {
          type: types.EXTEND_LOAN_FAILURE,
          payload: {
            message: 'error', checkoutId: 'checkoutId'
          },
          error: true
        })
      ).toEqual({
        isRequestingExtendLoan: false,
        extendLoanError: true
      })
    })
  })
})
