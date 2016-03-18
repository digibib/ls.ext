import { CHANGE_LANGUAGE } from '../constants/ActionTypes'

import * as i18n from '../i18n'

const initialState = {
  locale: 'no',
  messages: {
    no: { ...i18n.no }
  }
}

export default function application (state = initialState, action) {
  switch (action.type) {
    case (CHANGE_LANGUAGE):
      return Object.assign({}, state, {
        locale: action.payload.locale
      })
    default:
      return state
  }
}
