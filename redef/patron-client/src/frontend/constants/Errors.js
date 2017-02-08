export default {
  login: {
    INVALID_CREDENTIALS: 'invalidCredentials',
    GENERIC_LOGIN_ERROR: 'genericLoginError'
  },
  reservation: {
    TOO_MANY_RESERVES: 'tooManyReserves',
    GENERIC_RESERVATION_ERROR: 'genericReservationError',
    GENERIC_CANCEL_RESERVATION_ERROR: 'genericCancelReservationError',
    GENERIC_CHANGE_PICKUP_LOCATION_ERROR: 'genericChangePickupLocationError',
    GENERIC_CHANGE_RESERVATION_SUSPENSION_ERROR: 'genericChangeReservationSuspensionError'
  },
  loan: {
    GENERIC_EXTEND_LOAN_ERROR: 'genericExtendLoanError',
    TOO_SOON_TO_RENEW: 'tooSoonToRenewError',
    TOO_MANY_RENEWALS: 'tooManyRenewalsError',
    MATERIAL_IS_RESERVED: 'cannotRenewReservedMaterialError',
    MATERIAL_IS_RESTRICTED: 'cannotRenewRestrictedMaterialError'
  },
  profile: {
    CURRENT_PIN_NOT_CORRRECT: 'currentPinNotCorrect',
    GENERIC_CHANGE_PIN_ERROR: 'genericChangePinError'
  }
}
