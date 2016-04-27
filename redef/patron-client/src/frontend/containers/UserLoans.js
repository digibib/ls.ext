import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import MyPageActions from '../actions/MyPageActions'

const UserLoans = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    myPageActions: PropTypes.object.isRequired
  },
  render () {
    return (
      <div>UserLoans</div>
    )
  }
})

const messages = defineMessages({
})

function mapStateToProps (state) {
  return {
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
)(injectIntl(UserLoans))
