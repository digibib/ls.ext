import React, { createElement, PropTypes } from 'react'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { Field } from 'redux-form'

class FormSelectFieldLibrary extends React.Component {

  renderLibraryOptions () {
    const branchOptions = []
    const libraries = this.props.libraries
    Object.keys(libraries).forEach(branchCode => {
      const branchName = libraries[ branchCode ]
      branchOptions.push(
        <option key={branchCode} value={branchCode}>
          {branchName}
        </option>
      )
    })
    return branchOptions
  }

  render () {
    const formattedHeaderMsg = <FormattedMessage {...this.props.message} />
    const header = createElement(this.props.headerTag, {}, formattedHeaderMsg)
    return (
      <div className="form-item">
        {header}
        <div className="select-container">
          <Field name={this.props.name} component="select">
            {this.renderLibraryOptions()}
          </Field>
        </div>
      </div>
    )
  }
}

FormSelectFieldLibrary.propTypes = {
  libraries: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired,
  headerTag: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(FormSelectFieldLibrary)
