import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

const Root = ({ locale, messages, routes }) => (
  <IntlProvider key="intl"
                locale={locale}
                messages={messages[ locale ]}>
    {routes}
  </IntlProvider>
)

Root.propTypes = {
  locale: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired,
  routes: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    locale: state.application.locale,
    messages: state.application.messages
  }
}

export default connect(
  mapStateToProps
)(Root)
