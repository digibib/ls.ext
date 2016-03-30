import { RECEIVE_TRANSLATION } from '../constants/ActionTypes'
import * as i18n from '../i18n'

const initialState = {
  locale: 'no',
  messages: {
    no: { ...i18n.no }
  }
}

export default function application (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_TRANSLATION:
      return {
        ...state,
        locale: action.payload.locale,
        messages: {
          ...state.messages,
          [action.payload.locale]: {
            ...state.messages[ action.payload.locale ],
            ...action.payload.messages
          }
        }
      }
    default:
      return state
  }
}
