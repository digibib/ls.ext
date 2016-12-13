import { action } from './GenericActions'
import * as types from '../constants/ActionTypes'


export function resizeWindowWidth(windowWidth) {
  return (dispatch, getState) => {
    if(getState().application.windowWidth !== windowWidth) {
      dispatch(action(types.RESIZE_WINDOW_WIDTH, { windowWidth }))
    }
  }
}
