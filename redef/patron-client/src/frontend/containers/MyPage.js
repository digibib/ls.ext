import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { routerActions } from 'react-router-redux'

import * as ProfileActions from '../actions/ProfileActions'
import * as LoginActions from '../actions/LoginActions'
import Tabs from '../components/Tabs'

class MyPage extends React.Component {
  componentWillMount () {
    if (this.props.isLoggedIn) {
      this.props.profileActions.fetchAllProfileData()
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.isLoggedIn === false && this.props.isLoggedIn === true) {
      this.props.profileActions.fetchAllProfileData()
    }
  }

  renderNotLoggedIn () {
    return <div data-automation-id="profile_not_logged_in"><FormattedMessage {...messages.mustBeLoggedIn} /></div>
  }

  render () {
    if (!this.props.isLoggedIn) {
      return this.renderNotLoggedIn()
    }
    const tabList = [
      { label: this.props.intl.formatMessage(messages.loansAndReservations), path: '/profile/loans' },
      { label: this.props.intl.formatMessage(messages.personalInformation), path: '/profile/info' },
      { label: this.props.intl.formatMessage(messages.settings), path: '/profile/settings' }
    ]
    return (
      <main role="main" data-automation-id="profile_page" className="mypage-wrapper">
        <Tabs label={this.props.intl.formatMessage(messages.profileMenuLabel)}
              tabList={tabList}
              currentPath={this.props.location.pathname}
              push={this.props.routerActions.push} />
        <hr />
        <div className="clearfix" />
        {this.props.children}
      </main>
    )
  }
}

MyPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loginActions: PropTypes.object.isRequired,
  borrowerNumber: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  profileActions: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  routerActions: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  profileMenuLabel: {
    id: 'MyPage.profileMenuLabel',
    description: 'The label on the profile menu',
    defaultMessage: 'Profile menu'
  },
  loansAndReservations: {
    id: 'MyPage.loansAndReservations',
    description: 'The label on the loans and reservations tab',
    defaultMessage: 'Loans and reservations'
  },
  personalInformation: {
    id: 'MyPage.personalInformation',
    description: 'The label on the personal information tab',
    defaultMessage: 'Personal information'
  },
  settings: {
    id: 'MyPage.settings',
    description: 'The label on the settings tab',
    defaultMessage: 'Settings'
  },
  mustBeLoggedIn: {
    id: 'MyPage.mustBeLoggedIn',
    description: 'The message shown when not logged in',
    defaultMessage: 'Must be logged in to access this page.'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch),
    routerActions: bindActionCreators(routerActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MyPage))
