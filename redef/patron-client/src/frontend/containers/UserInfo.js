import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import MyPageActions from '../actions/MyPageActions'

const UserInfo = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    myPageActions: PropTypes.object.isRequired
  },
  render () {
    return (
      <div><p>UserInfo</p>
        <p><FormattedMessage {...messages.borrowerNumber} />: <span
          data-automation-id='borrowernumber'>{this.props.borrowerNumber}</span></p>
      </div>
    )
  }
})

const messages = defineMessages({
  borrowerNumber: {
    id: 'UserInfo.borrowerNumber',
    description: 'The label for borrower number',
    defaultMessage: 'Borrower number'
  }
})

function mapStateToProps (state) {
  return {
    borrowerNumber: state.application.borrowerNumber
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    myPageActions: bindActionCreators(MyPageActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserInfo))
