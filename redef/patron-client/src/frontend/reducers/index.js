import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import application from './application'
import search from './search'
import resources from './resources'

const rootReducer = combineReducers(Object.assign({}, { application, search, resources }, {
  routing: routerReducer
}))

export default rootReducer
