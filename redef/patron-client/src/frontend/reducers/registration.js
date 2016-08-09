import {
  TOGGLE_SSN_INFO,
  TOGGLE_TERMS_AND_CONDITIONS_INFO,
  REQUEST_CHECK_FOR_EXISTING_USER,
  CHECK_FOR_EXISTING_USER_SUCCESS,
  CHECK_FOR_EXISTING_USER_FAILURE,
  HIDE_MODAL
} from '../constants/ActionTypes'

const initialState = {
  showSSNInfo: false,
  isCheckingForExistingUser: false,
  checkForExistingUserSuccess: false,
  checkForExistingUserFailure: false,
  registrationError: false
}

export default function registration (state = initialState, action) {
  switch (action.type) {
    case TOGGLE_SSN_INFO:
      return {
        ...state,
        showSSNInfo: !state.showSSNInfo
      }
    case TOGGLE_TERMS_AND_CONDITIONS_INFO:
      return {
        ...state,
        showTermsAndConditions: !state.showTermsAndConditions
      }
    case REQUEST_CHECK_FOR_EXISTING_USER:
      return {
        ...state,
        isCheckingForExistingUser: true, checkForExistingUserSuccess: false, checkForExistingUserFailure: false
      }
    case CHECK_FOR_EXISTING_USER_SUCCESS:
      return {
        ...state,
        checkForExistingUserSuccess: true, isCheckingForExistingUser: false
      }
    case CHECK_FOR_EXISTING_USER_FAILURE:
      return {
        ...state,
        checkForExistingUserFailure: true, isCheckingForExistingUser: false, registrationError: action.payload.error
      }
    case HIDE_MODAL:
      return initialState
    default:
      return state
  }
}
