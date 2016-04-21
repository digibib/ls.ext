import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import application from './application'
import modal from './modal'
import search from './search'
import reservation from './reservation'
import resources from './resources'

const rootReducer = combineReducers({
  application, modal, search, reservation, resources,
  routing: routerReducer
})

export default rootReducer
