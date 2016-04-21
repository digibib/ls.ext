import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as LoginActions from '../actions/LoginActions'

const MyPage = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    loginActions: PropTypes.object.isRequired,
    borrowerNumber: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired,
    intl: intlShape.isRequired
  },
  componentDidUpdate () {
    if (!this.props.isLoggedIn) {
      this.props.loginActions.showLoginDialog()
    }
  },
  renderNotLoggedIn () {
    return <div data-automation-id='profile_not_logged_in'><FormattedMessage {...messages.mustBeLoggedIn} /></div>
  },
  render () {
    if (!this.props.isLoggedIn) {
      return this.renderNotLoggedIn()
    }
    return (
      <div>
        <p><FormattedMessage {...messages.borrowerNumber} />: <span
          data-automation-id='borrowernumber'>{this.props.borrowerNumber}</span></p>
      </div>
    )
  }
})

const messages = defineMessages({
  mustBeLoggedIn: {
    id: 'MyPage.mustBeLoggedIn',
    description: 'The message shown when not logged in',
    defaultMessage: 'Must be logged in to access this page.'
  },
  borrowerNumber: {
    id: 'MyPage.borrowerNumber',
    description: 'The label for borrower number',
    defaultMessage: 'Borrower number'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    loginError: state.application.loginError,
    borrowerNumber: state.application.borrowerNumber
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loginActions: bindActionCreators(LoginActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MyPage))
