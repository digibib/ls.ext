import { action } from './GenericActions'
import * as types from '../constants/ActionTypes'

export const resizeWindow = (windowWidth) => action(types.RESIZE_WINDOW, { windowWidth })
