import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

import application from './application'
import loan from './loan'
import mobileNavigation from './mobileNavigation'
import modal from './modal'
import profile from './profile'
import search from './search'
import reservation from './reservation'
import registration from './registration'
import resources from './resources'
import datepicker from './datepicker'

const rootReducer = combineReducers({
  application,
  loan,
  mobileNavigation,
  modal,
  profile,
  search,
  reservation,
  registration,
  resources,
  datepicker,
  routing: routerReducer,
  form: formReducer
})

export default rootReducer
