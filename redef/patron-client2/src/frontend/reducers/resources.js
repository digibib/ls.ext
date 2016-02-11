import { RECEIVE_RESOURCE, REQUEST_RESOURCE } from '../constants/ActionTypes'

const initialState = { isRequesting: false, resources: {} }

export default function resources (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_RESOURCE:
      let resources = {}
      resources[ action.payload.uri ] = action.payload.resource
      resources = Object.assign({}, state.resources, resources)
      return Object.assign({}, state, {
        resources: resources,
        isRequesting: false
      })
    case REQUEST_RESOURCE:
      return Object.assign({}, state, {
        isRequesting: true
      })
    default:
      return state
  }
}
