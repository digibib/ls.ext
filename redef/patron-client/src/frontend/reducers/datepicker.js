import { DATEPICKER_CHANGE_DATE } from '../constants/ActionTypes'
import moment from 'moment'

const initialState = {
  date: { date: moment().format('DD.MM.YYYY') },
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
