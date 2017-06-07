export default {
  login: {
    INVALID_CREDENTIALS: 'invalidCredentials',
    GENERIC_LOGIN_ERROR: 'genericLoginError'
  },
  reservation: {
    TOO_MANY_RESERVES: 'tooManyReserves',
    AGE_RESTRICTION: 'ageRestriction',
    GENERIC_RESERVATION_ERROR: 'genericReservationError',
    GENERIC_CANCEL_RESERVATION_ERROR: 'genericCancelReservationError',
    GENERIC_CHANGE_PICKUP_LOCATION_ERROR: 'genericChangePickupLocationError',
    GENERIC_CHANGE_RESERVATION_SUSPENSION_ERROR: 'genericChangeReservationSuspensionError'
  },
  loan: {
    GENERIC_EXTEND_LOAN_ERROR: 'genericExtendLoanError',
    TOO_SOON_TO_RENEW: 'tooSoonToRenew',
    TOO_MANY_RENEWALS: 'tooManyRenewals',
    MATERIAL_IS_RESERVED: 'materialIsReserved',
    PATRON_HAS_RESTRICTION: 'patronHasRestriction',
    PATRON_HAS_OVERDUE: 'patronHasOverdue'
  },
  profile: {
    CURRENT_PIN_NOT_CORRRECT: 'currentPinNotCorrect',
    GENERIC_CHANGE_PIN_ERROR: 'genericChangePinError'
  },
  history: {
    GENERIC_FETCH_HISTORY_ERROR: 'genericFetchHistoryError'
  }
}
