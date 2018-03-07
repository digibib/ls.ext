import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from '../containers/App'
import Search from '../containers/Search'
import Login from '../containers/Login'
import Work from '../containers/Work'
import Person from '../containers/Person'
import MyPage from '../containers/MyPage'
import UserLoans from '../containers/UserLoans'
import UserInfo from '../containers/UserInfo'
import UserSettings from '../containers/UserSettings'
import Register from '../containers/Register'
import { requireLoginBeforeAction } from '../actions/LoginActions'
import { SHOW_PRIVILEGED_ROUTE } from '../constants/ActionTypes'

export default function (store) {
  function requireLogin () {
    if (!store.getState().application.isLoggedIn) {
      store.dispatch(requireLoginBeforeAction({ type: SHOW_PRIVILEGED_ROUTE }))
    }
  }

  function scrollToTopUnlessGoingBack (prevState, nextState) {
    if (nextState.location.query.showStatus) {
      // Don't scroll to top when opening status in search result
      // TODO this information should probably be local state, not be encoded in URL
      return
    }

    if (nextState.location.action !== 'POP') {
      window.scrollTo(0, 0)
    }
  }

  const routes = (
    <Route
      path="/"
      component={App}
      onChange={scrollToTopUnlessGoingBack}
      >
      <IndexRoute component={Search} />
      <Route path="login" component={Login} />
      <Route path="search" component={Search} />
      <Route path="work/:workId" component={Work} />
      <Route path="work/:workId/publication/:publicationId" component={Work} />
      <Route path="person/:personId" component={Person} />
      <Route path="register" component={Register} />
      <Route path="profile" component={MyPage} onEnter={requireLogin}>
        <IndexRoute component={UserLoans} />
        <Route path="loans" component={UserLoans} />
        <Route path="info" component={UserInfo} />
        <Route path="settings" component={UserSettings} />
      </Route>
    </Route>
  )

  return routes
}
