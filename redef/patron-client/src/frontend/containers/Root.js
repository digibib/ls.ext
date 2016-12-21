import React, { PropTypes } from 'react'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { Router } from 'react-router'
import createRoutes from '../routes'

class Root extends React.Component {
  render () {
    const { locale, messages, history, store } = this.props
    if (!this.routes) {
      this.routes = createRoutes(store)
    }
    return (
      <Provider store={store}>
        <IntlProvider key="intl"
                      locale={locale}
                      messages={messages[ locale ]}>
          <Router history={history} routes={this.routes} />
        </IntlProvider>
      </Provider>
    )
  }
}

Root.propTypes = {
  locale: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
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
