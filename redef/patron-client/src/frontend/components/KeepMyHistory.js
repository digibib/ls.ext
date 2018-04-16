import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as ProfileActions from '../actions/ProfileActions'

class KeepMyHistory extends React.Component {

  constructor (props) {
    super(props)
    this.handleKeepMyHistory = this.handleKeepMyHistory.bind(this)
    this.handleSaveClick = this.handleSaveClick.bind(this)
  }

  handleKeepMyHistory (event) {
    if (event.keyCode === 32) { // Space for checkbox
      event.preventDefault()
      this.keepMyHistoryCheckbox.click()
    }
  }

  handleSaveClick (event) {
    // TODO bother to save if there is no changes? Ask M.
    const checked = this.keepMyHistoryCheckbox.checked
    if (checked) {
      this.props.profileActions.manageHistory(0, this.props.personalAttributes.hist_cons)
    } else {
      this.props.profileActions.userHistory()
    }
  }

  render () {
    return (
      <div key={Math.random()}>
        <div className="reminders-group">
          <div className="reminder-item" >
            <input data-automation-id="UserSettings_keepMyHistory"
                   type="checkbox"
                   name="keep-my-history"
                   id="keep-my-history"
                   ref={e => this.keepMyHistoryCheckbox = e}
                   onChange={this.handleKeepMyHistory}
                   defaultChecked={this.props.personalInformation.privacy === 0} />
            <label htmlFor="keep-my-history" onKeyDown={this.handleKeyKeepMyHistory}>
                <span className="checkbox-wrapper">
                  <i className="icon-check-empty checkbox-unchecked" role="checkbox" aria-checked="false" tabIndex="0" />
                  <i className="icon-ok-squared checkbox-checked" role="checkbox" aria-checked="true" tabIndex="0" />
                </span>
                <FormattedMessage {...messages.keepMyHistory} />
            </label>
          </div>

        </div>
        <footer>
          <button className="blue-btn"
                  type="button"
                  data-automation-id="UserSettings_saveConsentButton"
                  onClick={this.handleSaveClick}>
            <FormattedMessage {...messages.save} />
          </button>
          {this.props.postProfileSettingsSuccess
            ? (<span className="disclaimer">
                  <FormattedMessage {...messages.saveSuccess} />
                </span>)
            : null
          }
        </footer>
      </div>
    )
  }
}

KeepMyHistory.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired,
  personalAttributes: PropTypes.object.isRequired,
  postProfileSettingsSuccess: PropTypes.bool
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
  },
  saveSuccess: {
    id: 'UserSettings.saveSuccess',
    description: 'Success notification when settings are saved',
    defaultMessage: 'Changes are saved!'
  },
  save: {
    id: 'UserSettings.save',
    description: 'The label for the save button',
    defaultMessage: 'Save'
  }
})

function mapStateToProps (state) {
  return {
    postProfileSettingsSuccess: state.profile.postProfileSettingsSuccess
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(KeepMyHistory))
