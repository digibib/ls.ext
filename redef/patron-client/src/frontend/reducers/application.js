import { CHANGE_LANGUAGE } from '../constants/ActionTypes'

const initialState = {
  locale: 'no',
  messages: {
    no: {}
  }
}

export default function search (state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
