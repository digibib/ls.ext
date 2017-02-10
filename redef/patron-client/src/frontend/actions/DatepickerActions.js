import * as types from '../constants/ActionTypes'
import moment from 'moment'

export function handleDateChange (date) {
  return {
    type: types.DATEPICKER_CHANGE_DATE,
    payload: {
      date: {date: moment(date).format('DD.MM.YYYY')}
    }
  }
}
