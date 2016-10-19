import { action } from './GenericActions'
import * as types from '../constants/ActionTypes'

export const hideMobileNavigation = () => action(types.HIDE_MOBILE_NAVIGATION)

export const showMobileNavigation = () => action(types.SHOW_MOBILE_NAVIGATION)

export function toggleMobileNavigation () {
  return (dispatch, getState) => {
    getState().mobileNavigation.visible
      ? dispatch(hideMobileNavigation())
      : dispatch(showMobileNavigation())
  }
}
