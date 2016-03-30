import { browserHistory } from 'react-router'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createLogger from 'redux-logger'
import persistState from 'redux-localstorage'
import adapter from 'redux-localstorage/lib/adapters/localStorage'
import filter from 'redux-localstorage-filter'
import rootReducer from '../reducers'

const storage = compose(
  filter([ 'application.locale' ])
)(adapter(window.localStorage))

const reduxRouterMiddleware = routerMiddleware(browserHistory)
const loggerMiddleware = createLogger()
const createPersistentStoreWithMiddleware = compose(
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware,
    reduxRouterMiddleware
  ),
  persistState(storage, 'patron-client')
)(createStore)
const store = createPersistentStoreWithMiddleware(rootReducer)

export default store
