import * as types from '../constants/ActionTypes'
import moment from 'moment'

export function handleDateChange (date) {
  console.log('Moment original date', date)
  return {
    type: types.DATEPICKER_CHANGE_DATE,
    payload: {
      date: {date: date}
    }
  }
}
