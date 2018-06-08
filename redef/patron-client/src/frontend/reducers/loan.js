import {
  REQUEST_EXTEND_LOAN,
  EXTEND_LOAN_SUCCESS,
  EXTEND_LOAN_FAILURE,
  REQUEST_EXTEND_ALL_LOANS,
  REQUEST_START_PROCESS_PAYMENT,
  PAYMENT_SUCCESS,
  PROCESS_PAYMENT_CANCELLED,
  PROCESS_PAYMENT_FAILURE,
  SEND_PAYMENT_RECEIPT_ERROR,
  SEND_PAYMENT_RECEIPT_SUCCESS
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
  sendPaymentReceiptSuccess: false,
  sendPaymentReceiptError: null,
  successfulExtends: [],
  transactionId: null
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
      return { ...state, isSavingPayment: false, isPaymentSaved: true, isPaymentCancelled: false, successfulExtends: action.payload.successfulExtends, transactionId: action.payload.transactionId }
    case PROCESS_PAYMENT_CANCELLED:
      return { ...state, isSavingPayment: false, isPaymentSaved: false, isPaymentCancelled: true }
    case PROCESS_PAYMENT_FAILURE:
      return Object.assign({}, state, {
        isSavingPayment: false, isPaymentSaved: false, isPaymentCancelled: false, isPaymentFailed: true
      })
    case SEND_PAYMENT_RECEIPT_SUCCESS:
      return { ...state, sendPaymentReceiptSuccess: true, sendPaymentReceiptError: null }
    case SEND_PAYMENT_RECEIPT_ERROR:
      return { ...state, sendPaymentReceiptError: action.payload }
    default:
      return state
  }
}
