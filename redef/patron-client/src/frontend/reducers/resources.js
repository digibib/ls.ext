import { RESOURCE_FAILURE, RECEIVE_RESOURCE, REQUEST_RESOURCE } from '../constants/ActionTypes'

const initialState = { isRequesting: false, resources: {} }

export default function resources (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_RESOURCE:
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.id]: action.payload.resource
        },
        isRequesting: false,
        error: false
      }
    case RESOURCE_FAILURE:
      return {
        ...state,
        error: action.payload.message,
        isRequesting: false
      }
    case REQUEST_RESOURCE:
      return {
        ...state,
        isRequesting: true
      }
    default:
      return state
  }
}
