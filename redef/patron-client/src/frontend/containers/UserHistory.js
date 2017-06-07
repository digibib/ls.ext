import React, {PropTypes} from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'

import * as HistoryActions from '../actions/HistoryActions'
import {formatDate} from '../utils/dateFormatter'
import Loading from '../components/Loading'
import HistoryItems from '../components/HistoryItems'

class UserHistory extends React.Component {
  componentWillMount () {
    this.props.historyActions.fetchHistory()
  }
  render () {
    return (
      <HistoryItems historyItems={this.props.historyItems} />
    )
  }
}

UserHistory.propTypes = {}
export const messages = defineMessages({})

function mapStateToProps (state) {
  return {
    historyItems: state.history.historyData
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    historyActions: bindActionCreators(HistoryActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserHistory))
