import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const Footer = React.createClass({
  propTypes: {
    loadLanguage: PropTypes.func.isRequired,
    locale: PropTypes.string.isRequired,
    intl: intlShape.isRequired
  },
  handleChangeLanguage () {
    this.props.loadLanguage(this.props.locale === 'no' ? 'en' : 'no')
  },
  render () {
    return (
      <footer className='search-footer'>
        <nav className='secondary-navigation' type='navigation'>
          <ul>
            <li>Kontakt oss</li>
            <li>Åpningstider</li>
            <li data-automation-id='change_language_element'
                data-current-language={this.props.intl.formatMessage(messages.currentLanguage)}
                onClick={this.handleChangeLanguage}><FormattedMessage {...messages.languageChoice} /></li>
            <li>Om Oss</li>
          </ul>
        </nav>
        <div className='footer-text'>
          <p>
            Deichmanske bibliotek <br />
            Oslo kommune <br />
            Arne Garborgs plass 40179 Oslo <br />
            Telefon: +47 23 43 29 00 <br />
            Redaktør: Kristin Danielsen (biblioteksjef) <br />
          </p>
        </div>
        <div className='footer-icon'>
          <img src='/images/footer-icon.svg' alt='White box with black circle' />
        </div>
      </footer>
    )
  }
})

const messages = defineMessages({
  languageChoice: {
    id: 'Footer.languageChoice',
    description: 'Label for the link that changes the language, will be displayed in the language being chosen',
    defaultMessage: 'På norsk'
  },
  currentLanguage: {
    id: 'Footer.currentLanguage',
    description: 'The value of the currently applied language',
    defaultMessage: 'English'
  }
})

export default injectIntl(Footer)
