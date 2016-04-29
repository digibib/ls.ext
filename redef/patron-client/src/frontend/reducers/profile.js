import {LOGIN_FAILURE} from '../constants/ActionTypes'

const initialState = {
  loansAndReservations: {

  },
  personalInformation: {
    borrowerNumber: 'n1484848', /*should it be here?*/
    name: 'Ola finn Oddvar Nordmann',
    address: 'Midtisvingen 78',
    zipcode: '2478',
    city: 'Oslo',
    country: 'Norway',
    mobile: '987 65 432',
    telephone: '53 01 23 45',
    email: 'ola.finn.oddvar@online.no',
    birthdate: '1977-12-13',
    loanerCardIssued: '2012-01-30',
    loanerCategory: 'adult',
    lastUpdated: '2016-02-01'
  },
  settings: {
    alerts: {
      reminderOfExpiry: {
        sms: true,
        email: true
      },
      reminderOfPickup: {
        sms: true,
        email: true
      }
    },
    reciepts: {
      loans: {
        email: true
      },
      returns: {
        email: true
      }
    }
  }
}

export default function profile (state = initialState, action) {
  switch (action.type) {
    case LOGIN_FAILURE:
      return state
    default:
      return state
  }
}
