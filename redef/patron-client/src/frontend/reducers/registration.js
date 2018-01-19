import {
  TOGGLE_SSN_INFO,
  ACCEPT_TERMS,
  REQUEST_CHECK_FOR_EXISTING_USER,
  CHECK_FOR_EXISTING_USER_SUCCESS,
  CHECK_FOR_EXISTING_USER_FAILURE,
  REGISTRATION_SUCCESS,
  REGISTRATION_FAILURE
} from '../constants/ActionTypes'

const initialState = {
  showSSNInfo: false,
  acceptTerms: false,
  isCheckingForExistingUser: false,
  checkForExistingUserSuccess: false,
  checkForExistingUserFailure: false,
  registrationError: null
}

export default function registration (state = initialState, action) {
  switch (action.type) {
    case TOGGLE_SSN_INFO:
      return {
        ...state,
        showSSNInfo: !state.showSSNInfo
      }
    case ACCEPT_TERMS:
      return {
        ...state,
        acceptTerms: !state.acceptTerms
      }
    case REQUEST_CHECK_FOR_EXISTING_USER:
      return {
        ...state,
        isCheckingForExistingUser: true,
        checkForExistingUserSuccess: false,
        checkForExistingUserFailure: false,
        registrationError: null
      }
    case CHECK_FOR_EXISTING_USER_SUCCESS:
      return {
        ...state, checkForExistingUserSuccess: true, isCheckingForExistingUser: false, registrationError: null
      }
    case CHECK_FOR_EXISTING_USER_FAILURE:
      return {
        ...state,
        checkForExistingUserFailure: true,
        isCheckingForExistingUser: false,
        registrationError: action.payload.error
      }
    case REGISTRATION_SUCCESS:
      return {
        ...state,
        isSuccess: action.payload.isSuccess,
        username: action.payload.username,
        categoryCode: action.payload.categoryCode
      }
    case REGISTRATION_FAILURE:
      return {
        ...state,
        isError: true
      }
    default:
      return state
  }
}
