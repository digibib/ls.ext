import {
  REQUEST_EXTEND_LOAN,
  EXTEND_LOAN_FAILURE,
  EXTEND_LOAN_SUCCESS,
} from '../constants/ActionTypes'

const initialState = {
  isRequestingExtendLoan: false,
  extendLoanError: false,
}

export default function loan (state = initialState, action) {
  switch (action.type) {
    case REQUEST_EXTEND_LOAN:
      return { ...state, isRequestingExtendLoan: true, extendLoanError: false }
    case EXTEND_LOAN_SUCCESS:
      return { ...state, isRequestingExtendLoan: false, extendLoanError: false }
    case EXTEND_LOAN_FAILURE:
      return { ...state, isRequestingExtendLoan: false, extendLoanError: action.payload.error }
    default:
      return state
  }
}
