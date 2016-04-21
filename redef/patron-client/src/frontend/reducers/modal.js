import { SHOW_MODAL, HIDE_MODAL } from '../constants/ActionTypes'

const initialState = {
  modalType: null,
  modalProps: {}
}

export default function modal (state = initialState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return {
        modalType: action.payload.modalType,
        modalProps: action.payload.modalProps
      }
    case HIDE_MODAL:
      return initialState
    default:
      return state
  }
}
