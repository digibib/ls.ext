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
const middleware = [ thunkMiddleware, reduxRouterMiddleware ]

if (process.env.NODE_ENV !== 'production') {
  const loggerMiddleware = createLogger()
  middleware.push(loggerMiddleware)
}

const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose

export default (initialState) => {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      persistState(storage, 'patron-client')
    ))

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers'))
    })
  }

  return store
}
