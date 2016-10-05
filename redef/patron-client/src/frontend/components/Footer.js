import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this)
  }

  handleChangeLanguage () {
    this.props.loadLanguage(this.props.locale === 'no' ? 'en' : 'no')
  }

  render () {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear={true}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="footer"
        className="main-footer">
        <nav className="secondary-navigation" type="navigation">
          <ul>
            <li><FormattedMessage {...messages.contactUs} /></li>
            <li><FormattedMessage {...messages.openingHours} /></li>
            <li data-automation-id="change_language_element"
                data-current-language={this.props.intl.formatMessage(messages.currentLanguage)}
                onClick={this.handleChangeLanguage}><FormattedMessage {...messages.languageChoice} /></li>
            <li><FormattedMessage {...messages.aboutUs} /></li>
          </ul>
        </nav>
        <div className="footer-text">
          <p><FormattedHTMLMessage {...messages.info} /></p>
        </div>
        <div className="footer-icon">
          <img src="/images/footer-icon.svg" alt="White box with black circle" />
        </div>
      </ReactCSSTransitionGroup>
    )
  }
}

Footer.propTypes = {
  loadLanguage: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  contactUs: {
    id: 'Footer.contactUs',
    description: 'Label for the contact us link',
    defaultMessage: 'Contact us'
  },
  openingHours: {
    id: 'Footer.openingHours',
    description: 'Label for the opening hours link',
    defaultMessage: 'Opening hours'
  },
  languageChoice: {
    id: 'Footer.languageChoice',
    description: 'Label for the link that changes the language, will be displayed in the language being chosen',
    defaultMessage: 'På norsk'
  },
  currentLanguage: {
    id: 'Footer.currentLanguage',
    description: 'The value of the currently applied language',
    defaultMessage: 'English'
  },
  aboutUs: {
    id: 'Footer.aboutUs',
    description: 'Label for the about us link',
    defaultMessage: 'About us'
  },
  info: {
    id: 'Footer.info',
    description: 'The text containing the address, telephone number and other information',
    defaultMessage: 'Deichmanske bibliotek - Oslo public library <br />Oslo kommune <br />Arne Garborgs plass 4, 0179 Oslo, Norway <br />Telephone: +47 23 43 29 00 <br />Editor: Knut Skansen (acting Director) <br />'
  }
})

export default injectIntl(Footer)
