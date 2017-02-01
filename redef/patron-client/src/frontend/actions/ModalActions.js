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
  // TODO: A quick hack to work around an issue with the react modal.
  // aria-hidden is not removed upon closing the modal.
  document.getElementById('app').removeAttribute('aria-hidden')
  // End of hack
  return {
    type: types.HIDE_MODAL
  }
}
