import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

class OptInHistoryInfo extends React.Component {

  toggleSeeMore () {
    document.getElementById('see-more').classList.toggle('hidden')
  }

  render () {
    if (this.props.hasHistory) {
      return (
          <div>
            <h1><FormattedMessage {...messages.saveMyHistoryRevivalHeader} /></h1>
            <div><FormattedHTMLMessage {...messages.saveMyHistoryRevivalInformation} /></div>
            <a className="see-more-link" onClick={this.toggleSeeMore}><FormattedMessage {...messages.saveMyHistoryReadMoreLink} /></a>
            <div id="see-more" className="hidden"><FormattedHTMLMessage {...messages.saveMyHistoryReadMoreText} /></div>
            <p><FormattedHTMLMessage {...messages.saveMyHistoryDeclaration} /></p>
          </div>
      )
    }
    return (
        <div>
          <h1><FormattedMessage {...messages.saveMyHistoryHeader} /></h1>
          <div><FormattedHTMLMessage {...messages.saveMyHistoryInformation} /></div>
          <a className="see-more-link" onClick={this.toggleSeeMore}><FormattedMessage {...messages.saveMyHistoryReadMoreLink} /></a>
          <div id="see-more" className="hidden"><FormattedHTMLMessage {...messages.saveMyHistoryReadMoreText} /></div>
          <p><FormattedHTMLMessage {...messages.saveMyHistoryDeclaration} /></p>
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
  },
  saveMyHistoryDeclaration: {
    id: 'History.saveMyHistoryDeclaration',
    description: 'Text text with link to full privacy declaration',
    defaultMessage: 'Read our <a href="https://www.deichman.no/node/20992">privacy declaration</a>.'
  },
  saveMyHistoryReadMoreLink: {
    id: 'History.saveMyHistoryReadMoreLink',
    description: 'Link text for expanding details',
    defaultMessage: 'Read more'
  },
  saveMyHistoryReadMoreText: {
    id: 'History.saveMyHistoryReadMoreText',
    description: 'Text text with link to full privacy declaration',
    defaultMessage: 'TODO'
  }
})

export default OptInHistoryInfo
