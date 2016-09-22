import { browserHistory } from 'react-router'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createLogger from 'redux-logger'
import persistState from 'redux-localstorage'
import adapter from 'redux-localstorage/lib/adapters/localStorage'
import filter from 'redux-localstorage-filter'
import rootReducer from '../reducers'

const storage = typeof window !== 'undefined' ? compose(
  filter([ 'application.locale' ])
)(adapter(window.localStorage)) : null

const reduxRouterMiddleware = routerMiddleware(browserHistory)
const loggerMiddleware = createLogger()
const createPersistentStoreWithMiddleware = typeof window !== 'undefined'
  ? compose(
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware,
    reduxRouterMiddleware
  ),
  persistState(storage, 'patron-client')
)(createStore)
  : compose(
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware,
    reduxRouterMiddleware
  )
)(createStore)
const store = createPersistentStoreWithMiddleware(rootReducer)

export default store
