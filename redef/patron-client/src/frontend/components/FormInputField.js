import React, { PropTypes, createElement } from 'react'
import { Field } from 'redux-form'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

const FormInputField = ({ name, type, message, getValidator, headerType, hasLabel, isLabelOverInput }) => {
  const formattedHeaderMessage = <FormattedMessage {message} />
  const header = createElement(headerType, {}, formattedHeaderMessage)
  return (
    <Field name={name} type={type} component={field => {
      return (<div>
          {header}
          {hasLabel && isLabelOverInput ? <label htmlFor={field.name}><FormattedMessage {message} /></label> : null}
          <input {...field.input} type={field.type} name={field.name} id={field.name} />
          {hasLabel && !isLabelOverInput ? <label htmlFor={field.name}><FormattedMessage {message} /></label> : null}
          { getValidator ? getValidator(field) : null}</div>
      )
    }} />
  )
}

FormInputField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  message: PropTypes.object.isRequired,
  getValidator: PropTypes.func,
  intl: intlShape.isRequired,
  isLabelOverInput: PropTypes.bool.isRequired,
  hasLabel: PropTypes.bool.isRequired,
  headerType: PropTypes.string.isRequired
}

export default injectIntl(FormInputField)