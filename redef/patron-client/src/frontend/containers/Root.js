import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import createRoutes from '../routes';

const Root = ({ locale, messages, history, store }) => (
  <Provider store={store}>
    <IntlProvider key="intl"
                  locale={locale}
                  messages={messages[ locale ]}>
      <Router history={history} routes={createRoutes(store)}  />
    </IntlProvider>
  </Provider>
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
