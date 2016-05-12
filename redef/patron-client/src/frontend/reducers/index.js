import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

import application from './application'
import modal from './modal'
import profile from './profile'
import search from './search'
import reservation from './reservation'
import resources from './resources'

const rootReducer = combineReducers({
  application, modal, profile, search, reservation, resources,
  routing: routerReducer,
  form: formReducer
})

export default rootReducer
