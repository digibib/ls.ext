import {
  SHOW_MOBILE_NAVIGATION,
  HIDE_MOBILE_NAVIGATION
} from '../constants/ActionTypes'

const initialState = {
  visible: false
}

export default function mobileNavigation (state = initialState, action) {
  switch (action.type) {
    case SHOW_MOBILE_NAVIGATION: {
      return { visible: true }
    }
    case HIDE_MOBILE_NAVIGATION: {
      return { visible: false }
    }
    default:
      return state
  }
}
