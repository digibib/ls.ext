import PropTypes from 'prop-types'
import React from 'react'
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
    return (
      <div className="form-item">
        {!this.props.excludeLabel && !this.props.isLabelUnderInput
          ? <label htmlFor={this.props.name}><FormattedMessage {...this.props.message} /></label> : null}
        <div className="select-container">
          <Field name={this.props.name} component="select">
            {this.renderLibraryOptions()}
          </Field>
        </div>
        {!this.props.excludeLabel && this.props.isLabelUnderInput
          ? <label htmlFor={this.props.name}><FormattedMessage {...this.props.message} /></label> : null}
      </div>
    )
  }
}

FormSelectFieldLibrary.propTypes = {
  libraries: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired,
  headerTag: PropTypes.string,
  name: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isLabelUnderInput: PropTypes.bool,
  excludeLabel: PropTypes.bool
}

export default injectIntl(FormSelectFieldLibrary)
