import { CHANGE_LANGUAGE } from '../constants/ActionTypes'

import * as i18n from '../i18n'

const initialState = {
  locale: 'no',
  messages: {
    no: { ...i18n.no },
    en: { ...i18n.en }
  }
}

export default function application (state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
