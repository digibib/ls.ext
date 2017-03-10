import { DATEPICKER_CHANGE_DATE } from '../constants/ActionTypes'

const initialState = {
  date: null,
  datePickerProps: {}
}

export default function datepicker (state = initialState, action) {
  switch (action.type) {
    case DATEPICKER_CHANGE_DATE:
      return {
        date: action.payload.date
      }
    default:
      return state
  }
}
