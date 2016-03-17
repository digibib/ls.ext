import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import App from '../containers/App'
import Search from '../containers/Search'
import Work from '../containers/Work'
import Person from '../containers/Person'
import store from '../store'

const history = syncHistoryWithStore(browserHistory, store)

export default (
  <Router history={history}>
    <Route path='/' component={App}>
      <IndexRoute component={Search}/>
      <Route path='search' component={Search}/>
      <Route path='work/:id' component={Work}/>
      <Route path='person/:id' component={Person}/>
    </Route>
  </Router>
)
