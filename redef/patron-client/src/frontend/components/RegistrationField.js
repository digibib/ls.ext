import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

class RegistrationField extends React.Component {
  render () {
    return (
      <div>
        <h2><FormattedMessage {...messages.mobile} /></h2>
        <input name="mobile" type="text" id="mobile" {...mobile} />
        <label htmlFor="mobile"><FormattedMessage {...messages.mobile} /></label>
      </div>
    )
  }
}

RegistrationField.propTypes = {
  fieldName: PropTypes.string.isRequired
}

export default injectIntl(RegistrationField)
