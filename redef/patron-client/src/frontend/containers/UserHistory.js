import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { defineMessages, injectIntl } from 'react-intl'

import * as HistoryActions from '../actions/HistoryActions'
import * as ProfileActions from '../actions/ProfileActions'
import HistoryItems from '../components/HistoryItems'

const limit = 20

class UserHistory extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      hasMoreItems: true
    }
    this.loadItems = this.loadItems.bind(this)
  }

  componentWillMount () {
    this.props.historyActions.resetHistory()
  }

  loadItems () {
    if (this.props.isRequestingHistory || this.props.fetchHistoryFailure) {
      // We don't want to send multiple requests at a time
      return
    }
    this.props.historyActions.fetchHistory({ limit: limit, offset: parseInt(this.props.loadedHistoryItems) })
  }

  render () {
    return (
      <div key={Math.random()}> {/*  Ensures component rerendering */}

        {this.props.personalInformation.privacy === 0 ||
        this.props.personalInformation.privacy === 1 ||
        this.props.personalInformation.privacy === ''
          ? < HistoryItems historyItems={this.props.allLoadedHistory} historyActions={this.props.historyActions} loadItems={this.loadItems} hasMoreItems={this.props.hasMoreItems} />
          : null
        }
      </div>
    )
  }
}

UserHistory.propTypes = {
  historyActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired,
  loadedHistoryItems: PropTypes.number.isRequired,
  allLoadedHistory: PropTypes.array.isRequired,
  hasMoreItems: PropTypes.bool.isRequired,
  historyToDelete: PropTypes.array.isRequired,
  isRequestingHistory: PropTypes.bool.isRequired,
  fetchHistoryFailure: PropTypes.bool.isRequired
}

export const messages = defineMessages({
  keepMyHistory: {
    id: 'UserSettings.keepMyHistory',
    description: 'Label for checkbox which manages keep/discard history',
    defaultMessage: 'Keep my history'
  },
  myHistory: {
    id: 'UserSettings.history',
    description: 'Header for users My history',
    defaultMessage: 'My history'
  }
})

function mapStateToProps (state) {
  return {
    isRequestingHistory: state.history.isRequestingHistory,
    fetchHistoryFailure: state.history.fetchHistoryFailure,
    historyItems: state.history.historyData,
    allLoadedHistory: state.history.allLoadedHistory,
    loadedHistoryItems: state.history.loadedHistoryItems,
    hasMoreItems: state.history.moreToFetch,
    personalInformation: state.profile.personalInformation,
    historyToDelete: state.history.historyToDelete
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    historyActions: bindActionCreators(HistoryActions, dispatch),
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserHistory))
