import {
  RESOURCE_FAILURE,
  RECEIVE_RESOURCE,
  REQUEST_RESOURCE,
  ITEMS_FAILURE,
  RECEIVE_ITEMS,
  REQUEST_ITEMS,
  TOGGLE_SHOW_ADDITIONAL_INFORMATION
} from '../constants/ActionTypes'

const initialState = {
  isRequesting: false,
  resources: {},
  error: false,
  isRequestingItems: false,
  items: {},
  itemsError: false,
  showAdditionalInformation: []
}

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
    case RECEIVE_ITEMS:
      return {
        ...state,
        items: { ...state.items, ...action.payload.items },
        isRequestingItems: false,
        itemsError: false
      }
    case ITEMS_FAILURE:
      return {
        ...state,
        itemsError: action.payload.message,
        isRequestingItems: false
      }
    case REQUEST_ITEMS:
      return {
        ...state,
        isRequestingItems: true
      }
    case TOGGLE_SHOW_ADDITIONAL_INFORMATION:
      return {
        ...state,
        showAdditionalInformation: state.showAdditionalInformation.includes(action.payload.workId)
          ? state.showAdditionalInformation.filter(e => e !== action.payload.workId)
          : [ action.payload.workId ].concat(state.showAdditionalInformation)
      }
    default:
      return state
  }
}
