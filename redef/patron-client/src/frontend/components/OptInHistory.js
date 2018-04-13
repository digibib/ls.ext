import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

class OptInHistory extends React.Component {

  constructor (props) {
    super(props)

    this.handleSaveClick = this.handleSaveClick.bind(this)
  }

  handleSaveClick (event) {
    event.preventDefault()
    this.props.profileActions.manageHistoryConsent(true, this.props.personalAttributes.hist_cons)
  }

  render () {
    return (
        <section
        className="history"
        style={{ marginTop: '1em' }}>
          {this.props.personalInformation.privacy === '0'
            ? <h1><FormattedMessage {...messages.saveMyHistoryRevivalHeader} /></h1>
            : <h1><FormattedMessage {...messages.saveMyHistoryHeader} /></h1>
          }
          <p >
            <FormattedHTMLMessage {...messages.saveMyHistoryInformation} />
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
  personalInformation: PropTypes.object.isRequired,
  personalAttributes: PropTypes.object.isRequired
}

export const messages = defineMessages({
  saveConsent: {
    id: 'UserSettings.saveConsent',
    description: 'The label for the save button',
    defaultMessage: 'Keep my checkout history'
  },
  saveMyHistoryHeader: {
    id: 'UserSettings.saveMyHistoryHeader',
    description: 'The heading for save my history consent',
    defaultMessage: 'You are now able to save yor history!'
  },
  saveMyHistoryRevivalHeader: {
    id: 'UserSettings.saveMyHistoryRevivalHeader',
    description: 'The heading for save my history consent',
    defaultMessage: 'Checkout history is back!'
  },
  saveMyHistoryInformation: {
    id: 'UserSettings.saveMyHistoryInformation',
    description: 'The heading for save my history consent',
    defaultMessage: 'You will have a full history of what you have ...'
  }
})

export default OptInHistory
