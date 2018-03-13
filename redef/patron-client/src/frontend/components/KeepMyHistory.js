import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

class KeepMyHistory extends React.Component {

  constructor (props) {
    super(props)

    this.handleKeyKeepMyHistory = this.handleKeyKeepMyHistory.bind(this)
    this.handleKeepMyHistory = this.handleKeepMyHistory.bind(this)
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
      <div key={Math.random()} className="reminders-group">
        <div className="reminder-item" >
          <input data-automation-id="UserSettings_keepMyHistory"
                 type="checkbox"
                 name="keep-my-history"
                 id="keep-my-history"
                 onClick={this.handleKeepMyHistory}
                 defaultChecked={this.props.personalInformation.privacy === 0 ||
                 this.props.personalInformation.privacy === 1 ||
                 this.props.personalInformation.privacy === ''} />
          <label htmlFor="keep-my-history" onKeyDown={this.handleKeyKeepMyHistory}>
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" role="checkbox" aria-checked="false" tabIndex="0" />
                <i className="icon-ok-squared checkbox-checked" role="checkbox" aria-checked="true" tabIndex="0" />
              </span>
              <FormattedMessage {...messages.keepMyHistory} />
          </label>
        </div>
      </div>
    )
  }
}

KeepMyHistory.propTypes = {
  profileActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired
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

export default KeepMyHistory
