import { browserHistory } from 'react-router'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

const reduxRouterMiddleware = routerMiddleware(browserHistory)
const loggerMiddleware = createLogger()
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  loggerMiddleware,
  reduxRouterMiddleware
)(createStore)
const store = createStoreWithMiddleware(rootReducer)

export default store
