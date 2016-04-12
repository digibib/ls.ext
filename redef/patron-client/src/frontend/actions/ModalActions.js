import * as types from '../constants/ActionTypes'

export function showModal (modalType, modalProps) {
  return {
    type: types.SHOW_MODAL,
    payload: {
      modalType: modalType,
      modalProps: modalProps
    }
  }
}

export function hideModal () {
  return {
    type: types.HIDE_MODAL
  }
}
