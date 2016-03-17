import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import routes from '../routes'
import { IntlProvider } from 'react-intl'

const Root = React.createClass({
  propTypes: {},
  render () {
    return (
      <IntlProvider key='intl' locale={this.props.locale}
                    messages={this.props.messages[this.props.locale]}>{routes}</IntlProvider>
    )
  }
})

function mapStateToProps (state) {
  return {
    locale: state.application.locale,
    messages: state.application.messages
  }
}

export default connect(
  mapStateToProps
)(Root)
