import { CHANGE_RESERVATION_SUSPENSION_SUCCESS, DATEPICKER_CHANGE_DATE } from '../constants/ActionTypes'

const initialState = {
  date: null,
  datePickerProps: {}
}

export default function datepicker (state = initialState, action) {
  switch (action.type) {
    case CHANGE_RESERVATION_SUSPENSION_SUCCESS:
      return {
        date: null
      }
    case DATEPICKER_CHANGE_DATE:
      return {
        date: action.payload.date
      }
    default:
      return state
  }
}
