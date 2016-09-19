import React, { PropTypes, createElement } from 'react'
import { Field } from 'redux-form'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

class FormInputField extends React.Component {
  constructor (props) {
    super(props)
    this.renderField = this.renderField.bind(this)
  }

  render () {
    return (
      <Field name={this.props.name} type={this.props.type} component={this.renderField} />
    )
  }

  renderField (field) {
    const formattedHeaderMessage = <FormattedMessage {...this.props.message} />
    const header = createElement(this.props.headerType, {}, formattedHeaderMessage)
    return (
      <div>
        {header}
        {this.props.hasLabel && this.props.isLabelOverInput
          ? <label htmlFor={field.name}><FormattedMessage {...this.props.message} /></label> : null}
        <input placeholder={this.props.placeholder ? this.props.intl.formatMessage(this.props.placeholder) : null}
               data-automation-id={`${this.props.formName}_${field.name}`} {...field.input} type={field.type}
               name={field.name} id={field.name} />
        {this.props.hasLabel && !this.props.isLabelOverInput
          ? <label htmlFor={field.name}><FormattedMessage {...this.props.message} /></label> : null}
        { this.props.getValidator ? this.props.getValidator(field) : null}
      </div>
    )
  }
}

FormInputField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  message: PropTypes.object.isRequired,
  getValidator: PropTypes.func,
  intl: intlShape.isRequired,
  isLabelOverInput: PropTypes.bool,
  hasLabel: PropTypes.bool,
  headerType: PropTypes.string.isRequired,
  formName: PropTypes.string.isRequired,
  placeholder: PropTypes.object
}

export default injectIntl(FormInputField)
