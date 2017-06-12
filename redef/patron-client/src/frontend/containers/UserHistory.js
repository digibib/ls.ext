import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, injectIntl} from 'react-intl'

import * as HistoryActions from '../actions/HistoryActions'
import HistoryItems from '../components/HistoryItems'

/* const args = {
  limit: 10,
  offset: 0
} */

class UserHistory extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasMoreItems: true,
    }
  }
  componentWillMount () {
    this.props.historyActions.fetchHistory({limit: 2, offset:0})
  }

  loadItems = (args) => {
    this.props.historyActions.fetchHistory({limit: 2, offset: 2})
    this.setState({ hasMoreItems: false })
  }

  render () {
    return (
      <HistoryItems historyItems={this.props.historyItems} loadItems={this.loadItems} hasMoreItems={this.state.hasMoreItems} />
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
