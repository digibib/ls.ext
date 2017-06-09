import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, injectIntl} from 'react-intl'

import * as HistoryActions from '../actions/HistoryActions'
import HistoryItems from '../components/HistoryItems'

class UserHistory extends React.Component {
  componentWillMount () {
    this.props.historyActions.fetchHistory({limit: 10, offset:4})
  }

  loadItems = (args) => {
    this.props.historyActions.fetchHistory(JSON.strinify(args))
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
