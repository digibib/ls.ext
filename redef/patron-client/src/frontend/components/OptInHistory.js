import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import OptInHistoryInfo from './OptInHistoryInfo'

class OptInHistory extends React.Component {

  constructor (props) {
    super(props)

    this.handleSaveClick = this.handleSaveClick.bind(this)
  }

  handleSaveClick (event) {
    event.preventDefault()
    this.props.profileActions.manageHistoryConsent(true, this.props.personalAttributes.hist_cons, 'history tab')
  }

  render () {
    return (
        <section
        className="history"
        style={{ marginTop: '1em' }}>
          <OptInHistoryInfo
            hasHistory={this.props.personalInformation.privacy === 0}
          />
          <button className="blue-btn"
                  type="button"
                  data-automation-id="OptInHistory_saveButton"
                  onClick={this.handleSaveClick} >
            <FormattedMessage {...messages.saveConsent} />
          </button >
        </section >
    )
  }
}

OptInHistory.propTypes = {
  profileActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired,
  personalAttributes: PropTypes.object.isRequired
}

export const messages = defineMessages({
  saveConsent: {
    id: 'UserSettings.saveConsent',
    description: 'The label for the save button',
    defaultMessage: 'Keep my checkout history'
  }
})

export default OptInHistory
