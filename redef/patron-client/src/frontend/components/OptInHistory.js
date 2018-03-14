import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

class OptInHistory extends React.Component {

  constructor (props) {
    super(props)

    this.handleSaveClick = this.handleSaveClick.bind(this)
  }

  handleSaveClick (event) {
    event.preventDefault()
    this.props.profileActions.manageHistoryConsent(true)
  }

  render () {
    return (
        <section
        className="history"
        style={{ marginTop: '1em' }}>
          <h1><FormattedMessage {...messages.saveMyHistoryHeader} /></h1 >
          <p >
            <FormattedMessage {...messages.saveMyHistoryInformation} />
          </p >
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
  personalInformation: PropTypes.object.isRequired
}

export const messages = defineMessages({
  saveConsent: {
    id: 'UserSettings.saveConsent',
    description: 'The label for the save button',
    defaultMessage: 'Yes please'
  },
  saveMyHistoryHeader: {
    id: 'UserSettings.saveMyHistoryHeader',
    description: 'The heading for save my history consent',
    defaultMessage: 'You are now able to save yor history!'
  },
  saveMyHistoryInformation: {
    id: 'UserSettings.saveMyHistoryInformation',
    description: 'The heading for save my history consent',
    defaultMessage: 'You will have a full history of what you have ...'
  }
})

export default OptInHistory
