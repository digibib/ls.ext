import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { routerActions } from 'react-router-redux'

import * as ProfileActions from '../actions/ProfileActions'
import * as LoginActions from '../actions/LoginActions'
import * as ModalActions from '../actions/ModalActions'
import Tabs from '../components/Tabs'
import ModalComponents from '../constants/ModalComponents'

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
    if (Object.keys(this.props.personalAttributes).length > 0 && !this.props.personalAttributes.hist_cons) {
      // This modal should only be showed once for the user,
      // if consent is set, either to yes or no, don't display anything.
      this.props.modalActions.showModal(ModalComponents.HISTORY_INFO_MODAL, { isSuccess: true })
    }
  }

  renderNotLoggedIn () {
    return <div data-automation-id="profile_not_logged_in"><FormattedMessage {...messages.mustBeLoggedIn} /></div>
  }

  render () {
    if (!this.props.isLoggedIn) {
      return this.renderNotLoggedIn()
    }
    const hideTabs = '/profile/payment-response/' === this.props.location.pathname
    let tabList = [
      { label: this.props.intl.formatMessage(messages.loansAndReservations), path: '/profile/loans' },
      { label: this.props.intl.formatMessage(messages.personalInformation), path: '/profile/info' },
      { label: this.props.intl.formatMessage(messages.settings), path: '/profile/settings' },
      { label: this.props.intl.formatMessage(messages.history), path: '/profile/history' }
    ]
    return (
      <main role="main" data-automation-id="profile_page" className="mypage-wrapper">
        <div className="wrapper" style={{padding: '1em'}}>
          {!hideTabs &&
            <Tabs label={this.props.intl.formatMessage(messages.profileMenuLabel)}
                  tabList={tabList}
                  currentPath={this.props.location.pathname}
                  push={this.props.routerActions.push} />
          }
          {!hideTabs &&
            <hr />
          }
          <div className="clearfix" />
          {this.props.children}
        </div>
      </main>
    )
  }
}

MyPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loginActions: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  borrowerNumber: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  profileActions: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  routerActions: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  intl: intlShape.isRequired,
  personalAttributes: PropTypes.object.isRequired
}

export const messages = defineMessages({
  history: {
    id: 'MyPage.history',
    description: 'The label on the history tab',
    defaultMessage: 'History'
  },
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
    personalAttributes: state.profile.personalAttributes,
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch),
    routerActions: bindActionCreators(routerActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MyPage))
