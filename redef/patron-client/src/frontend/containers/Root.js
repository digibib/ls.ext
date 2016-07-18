import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import routes from '../routes'
import { IntlProvider } from 'react-intl'

class Root extends React.Component {
  render () {
    return (
      <IntlProvider key="intl" locale={this.props.locale}
                    messages={this.props.messages[this.props.locale]}>{routes}</IntlProvider>
    )
  }
}

Root.propTypes = {
  locale: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired
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
