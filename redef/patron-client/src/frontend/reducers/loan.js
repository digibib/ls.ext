import {
  REQUEST_EXTEND_LOAN,
  EXTEND_LOAN_SUCCESS,
  EXTEND_LOAN_FAILURE,
  REQUEST_EXTEND_ALL_LOANS
} from '../constants/ActionTypes'

const initialState = {
  isRequestingExtendLoan: false,
  isRequestingExtendAllLoans: false,
  extendLoanError: false,
  hasRequestedRenewAll: false
}

export default function loan (state = initialState, action) {
  switch (action.type) {
    case REQUEST_EXTEND_LOAN:
      return { ...state, isRequestingExtendLoan: true, extendLoanError: false }
    case EXTEND_LOAN_SUCCESS:
      return { ...state, isRequestingExtendLoan: false, extendLoanError: false }
    case EXTEND_LOAN_FAILURE:
      return { ...state, isRequestingExtendLoan: false, extendLoanError: true }
    case REQUEST_EXTEND_ALL_LOANS:
      return { ...state, isRequestingExtendAllLoans: true, extendLoanError: false, hasRequestedRenewAll: true }
    default:
      return state
  }
}
