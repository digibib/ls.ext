import 'es5-shim'
import 'babel-polyfill'
import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { browserHistory } from 'react-router'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { syncHistory } from 'react-router-redux'
import createLogger from 'redux-logger'

import App from './containers/App'
import Search from './containers/Search'
import Work from './containers/Work'
import Person from './containers/Person'
import rootReducer from './reducers'

const reduxRouterMiddleware = syncHistory(browserHistory)
const loggerMiddleware = createLogger()
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  loggerMiddleware,
  reduxRouterMiddleware
)(createStore)
const store = createStoreWithMiddleware(rootReducer)
reduxRouterMiddleware.listenForReplays(store)

const routes = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={Search}/>
        <Route path='search' component={Search}/>
        <Route path='work/:id' component={Work}/>
        <Route path='person/:id' component={Person}/>
      </Route>
    </Router>
  </Provider>
)

ReactDOM.render(routes, document.getElementById('app'))
