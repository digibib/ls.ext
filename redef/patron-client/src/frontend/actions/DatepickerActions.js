import * as types from '../constants/ActionTypes'

export function handleDateChange (date) {
  return {
    type: types.DATEPICKER_CHANGE_DATE,
    payload: {
      date: {date: date}
    }
  }
}
