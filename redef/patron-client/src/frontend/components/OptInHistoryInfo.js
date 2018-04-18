import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

class OptInHistoryInfo extends React.Component {

  render () {
    if (this.props.hasHistory) {
      return (
          <div>
            <h1><FormattedMessage {...messages.saveMyHistoryRevivalHeader} /></h1>
            <p><FormattedHTMLMessage {...messages.saveMyHistoryRevivalInformation} /></p>
          </div>
      )
    }
    return (
        <div>
          <h1><FormattedMessage {...messages.saveMyHistoryHeader} /></h1>
          <p><FormattedHTMLMessage {...messages.saveMyHistoryInformation} /></p>
        </div>
    )
  }
}

OptInHistoryInfo.propTypes = {
  hasHistory: PropTypes.bool.isRequired
}

export const messages = defineMessages({
  saveMyHistoryHeader: {
    id: 'History.saveMyHistoryHeader',
    description: 'The heading for save my history consent',
    defaultMessage: 'You are now able to save yor history!'
  },
  saveMyHistoryRevivalHeader: {
    id: 'History.saveMyHistoryRevivalHeader',
    description: 'The heading for save my history consent for users opted in in previous system',
    defaultMessage: 'Checkout history is back!'
  },
  saveMyHistoryInformation: {
    id: 'History.saveMyHistoryInformation',
    description: 'The text for save my history consent',
    defaultMessage: 'You will have a full history of what you have ...'
  },
  saveMyHistoryRevivalInformation: {
    id: 'History.saveMyHistoryRevivalInformation',
    description: 'The text for save my history consent for users opted in in previous system',
    defaultMessage: 'You will have a full history of what you have ...'
  }
})

export default OptInHistoryInfo
