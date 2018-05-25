import {
  REQUEST_EXTEND_LOAN,
  EXTEND_LOAN_SUCCESS,
  EXTEND_LOAN_FAILURE,
  REQUEST_EXTEND_ALL_LOANS,
  REQUEST_START_PROCESS_PAYMENT,
  PAYMENT_SUCCESS,
  PROCESS_PAYMENT_CANCELLED,
  PROCESS_PAYMENT_FAILURE
} from '../constants/ActionTypes'

const initialState = {
  isRequestingExtendLoan: false,
  isRequestingExtendAllLoans: false,
  extendLoanError: false,
  hasRequestedRenewAll: false,
  isSavingPayment: true,
  isPaymentSaved: false,
  isPaymentCancelled: false,
  isPaymentFailed: false,
  successfulExtends: [],
  failedExtends: []
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
    case REQUEST_START_PROCESS_PAYMENT:
      return { ...state, isSavingPayment: true, isPaymentSaved: false }
    case PAYMENT_SUCCESS:
      return { ...state, isSavingPayment: false, isPaymentSaved: true, isPaymentCancelled: false, successfulExtends: action.payload.successfulExtends, failedExtends: action.payload.failedExtends }
    case PROCESS_PAYMENT_CANCELLED:
      return { ...state, isSavingPayment: false, isPaymentSaved: false, isPaymentCancelled: true }
    case PROCESS_PAYMENT_FAILURE:
      return Object.assign({}, state, {
        isSavingPayment: false, isPaymentSaved: false, isPaymentCancelled: false, isPaymentFailed: true
      })
    default:
      return state
  }
}
