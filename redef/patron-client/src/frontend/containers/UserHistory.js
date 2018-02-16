import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'

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
    this.handleKeyKeepMyHistory = this.handleKeyKeepMyHistory.bind(this)
    this.handleKeepMyHistory = this.handleKeepMyHistory.bind(this)
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

  handleKeyKeepMyHistory (event) {
    if (event.keyCode === 32) { // Space for checkbox
      event.preventDefault()
      this.handleKeepMyHistory.click()
    }
  }

  handleKeepMyHistory (event) {
    event.preventDefault()
    if (this.props.personalInformation.privacy === 0 || this.props.personalInformation.privacy === 1 || this.props.personalInformation.privacy === '') {
      this.props.profileActions.userHistory()
    } else if (this.props.personalInformation.privacy === 2) {
      this.props.profileActions.manageHistory(0)
    }
  }

  render () {
    return (
      <div key={Math.random()}> {/*  Ensures component rerendering */}
        <div className="reminder-item" style={{ width: '20em', marginTop: '1em' }}>
          <input data-automation-id="UserSettings_keepMyHistory"
                 type="checkbox"
                 name="keep-my-history"
                 id="keep-my-history"
                 onClick={this.handleKeepMyHistory}
                 defaultChecked={this.props.personalInformation.privacy === 0 ||
                 this.props.personalInformation.privacy === 1 ||
                 this.props.personalInformation.privacy === ''} />
          <label htmlFor="keep-my-history" onKeyDown={this.handleKeyKeepMyHistory}>
              <span className="checkbox-wrapper" style={{ display: 'inline-block' }}>
                <i className="icon-check-empty checkbox-unchecked" role="checkbox" aria-checked="false" tabIndex="0" />
                <i className="icon-ok-squared checkbox-checked" role="checkbox" aria-checked="true" tabIndex="0" />
              </span>&nbsp;
              <FormattedMessage {...messages.keepMyHistory} />
          </label>
        </div>
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
  historyToDelete: PropTypes.array.isRequired
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
