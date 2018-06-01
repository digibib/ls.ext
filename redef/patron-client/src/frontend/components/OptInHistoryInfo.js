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
    defaultMessage: 'Now you can have an overview of everything you have borrowed from us!'
  },
  saveMyHistoryRevivalHeader: {
    id: 'History.saveMyHistoryRevivalHeader',
    description: 'The heading for save my history consent for users opted in in previous system',
    defaultMessage: 'Borrowing history is back!'
  },
  saveMyHistoryInformation: {
    id: 'History.saveMyHistoryInformation',
    description: 'The text for save my history consent',
    defaultMessage: '<p><strong>If you choose to allow the system to preserve your borrowing history, you’ll be able to view your previous loans. In addition, we’re better able to adjust our services to your needs, by for example giving you recommendations based on your previous loans. Making use of these services is optional.</strong></p><p>You can delete part or all of your history at any time, or deactivate the function completely via “My profile”.</p><p><strong>What does this mean for you?</strong></p>'
  },
  saveMyHistoryRevivalInformation: {
    id: 'History.saveMyHistoryRevivalInformation',
    description: 'The text for save my history consent for users opted in in previous system',
    defaultMessage: '<p><strong>Since the terms of use have changed, you will need to confirm that you would still like us to preserve your borrowing history. In addition to being able to see all your previous loans, you will also notice that we are able to tailor our services to your needs, for example by giving you automated recommendations based on your borrowing history. This type of extra service is optional.</strong></p><p>If you choose to allow the system to preserve your borrowing history, you’ll be able to view your previous loans in “My profile”. You can delete part or all of your history at any time, or deactivate the function completely via “My profile”.</p><p><strong>What does this mean for you?</strong></p>'
  },
  saveMyHistoryDeclaration: {
    id: 'History.saveMyHistoryDeclaration',
    description: 'Text text with link to full privacy declaration',
    defaultMessage: 'You can read our entire <a href="https://www.deichman.no/node/20992">digital security policy here</a>.'
  },
  saveMyHistoryReadMoreLink: {
    id: 'History.saveMyHistoryReadMoreLink',
    description: 'Link text for expanding details',
    defaultMessage: 'Read more here'
  },
  saveMyHistoryReadMoreText: {
    id: 'History.saveMyHistoryReadMoreText',
    description: 'Text text with link to full privacy declaration',
    defaultMessage: '<p>We will not:</p><ul><li>share your personal information with other users</li><li>share your personal information with any outside parties or  providers of other services outside of the library</li></ul><p>We can:</p><ul><li>Anonymise your data and use it in a way that gives you and other library users better services. One example is automated recommendations that let you know what others who have read the same book have borrowed.</li></ul><p>What do we mean by anonymised? This means that your borrowing history and data about your loans cannot be traced back to you.</p><p>If you haven’t logged into “My profile” or borrowed anything during a 36-month period, your borrowing history will be anonymized and no longer visible on "My profile". You will be notified of this in advance.</p>'
  }
})

export default OptInHistoryInfo
