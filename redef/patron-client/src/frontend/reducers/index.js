import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import search from './search'
import resources from './resources'

const rootReducer = combineReducers(Object.assign({}, { search, resources }, {
  routing: routerReducer
}))

export default rootReducer
