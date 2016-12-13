import React from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'

import App from '../containers/App'
import Search from '../containers/Search'
import Work from '../containers/Work'
import Person from '../containers/Person'
import MyPage from '../containers/MyPage'
import UserLoans from '../containers/UserLoans'
import UserInfo from '../containers/UserInfo'
import UserSettings from '../containers/UserSettings'
import { requireLoginBeforeAction } from '../actions/LoginActions'
import { SHOW_PRIVILEGED_ROUTE } from '../constants/ActionTypes'

export default function createRoutes(store) {
  function requireLogin () {
    if (!store.getState().application.isLoggedIn) {
      store.dispatch(requireLoginBeforeAction({ type: SHOW_PRIVILEGED_ROUTE }))
    }
  }

  const routes = (
    <Route path="/" component={App}>
      <IndexRoute component={Search} />
      <Route path="search" component={Search} />
      <Route path="work/:workId" component={Work} />
      <Route path="work/:workId/publication/:publicationId" component={Work} />
      <Route path="person/:personId" component={Person} />
      <Route path="profile" component={MyPage} /*onEnter={requireLogin}*/>
        <IndexRoute component={UserLoans} />
        <Route path="loans" component={UserLoans} />
        <Route path="info" component={UserInfo} />
        <Route path="settings" component={UserSettings} />
      </Route>
    </Route>
  )

  return routes
}
