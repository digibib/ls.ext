import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { RouterContext } from 'react-router'

const App = ({ messages, locale, renderProps }) => (
  <IntlProvider key="intl" locale={locale} messages={messages[ locale ]}>
    <RouterContext {...renderProps} />
  </IntlProvider>
)

const mapStateToProps = (state) => {
  return {
    messages: state.application.messages
  }
}

App.propTypes = {
  messages: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  renderProps: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(App)
