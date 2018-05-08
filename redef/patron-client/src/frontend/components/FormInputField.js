import PropTypes from 'prop-types'
import React, { createElement } from 'react'
import { Field } from 'redux-form'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

class FormInputField extends React.Component {
  constructor (props) {
    super(props)
    this.renderField = this.renderField.bind(this)
  }

  render () {
    return (
      <Field name={this.props.name} type={this.props.type ? this.props.type : 'text'} component={this.renderField} />
    )
  }

  renderField (field) {
    const formattedHeaderMessage = <FormattedMessage {...this.props.message} />
    const header = this.props.headerType ? createElement(this.props.headerType, {}, formattedHeaderMessage) : null
    return (
      <div className={`form-item ${field.meta.error && field.meta.touched ? 'error' : ''}`}>
        {header}
        {!this.props.excludeLabel && !this.props.isLabelUnderInput
          ? <label htmlFor={field.name}><FormattedMessage {...this.props.message} /></label> : null}
        <input placeholder={this.props.placeholder ? this.props.intl.formatMessage(this.props.placeholder) : null}
               data-automation-id={`${this.props.formName}_${field.name}`} {...field.input}
               type={field.type}
               name={field.name}
               id={field.name}
               className=""
               maxLength={this.props.maxLength}
        />
        {!this.props.excludeLabel && this.props.isLabelUnderInput
          ? <label htmlFor={field.name}><FormattedMessage {...this.props.message} /></label> : null}
        {this.props.getValidator ? this.props.getValidator(field) : null}
      </div>
    )
  }
}

FormInputField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  message: PropTypes.object.isRequired,
  getValidator: PropTypes.func,
  intl: intlShape.isRequired,
  isLabelUnderInput: PropTypes.bool,
  excludeLabel: PropTypes.bool,
  headerType: PropTypes.string,
  formName: PropTypes.string.isRequired,
  placeholder: PropTypes.object,
  maxLength: PropTypes.string

}

export default injectIntl(FormInputField)
