import React, { createElement, PropTypes } from 'react'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

import FormInputField from './FormInputField'

const FormInputFieldContainer = ({
  fieldName, fieldType, hasFieldLabel, fieldHeaderType, isFieldHeaderOverLabel, fieldMessage, getFieldValidator,
  containerTag, containerProps, headerTag, headerMessage, formName, placeholder
}) => {
  let formattedHeaderMessage
  if (headerTag && headerMessage) {
    formattedHeaderMessage = <FormattedMessage {...headerMessage} />
  }
  const inputField = <FormInputField name={fieldName} type={fieldType} message={fieldMessage} formName={formName}
                                     getValidator={getFieldValidator} hasLabel={hasFieldLabel} placeholder={placeholder}
                                     isLabelOverInput={isFieldHeaderOverLabel} headerType={fieldHeaderType} />

  return createElement(containerTag, containerProps,
    headerTag && headerMessage ? createElement(headerTag, {}, formattedHeaderMessage) : null,
    inputField)
}

FormInputFieldContainer.propTypes = {
  fieldName: PropTypes.string.isRequired,
  fieldType: PropTypes.string.isRequired,
  hasFieldLabel: PropTypes.bool,
  fieldHeaderType: PropTypes.string.isRequired,
  isFieldHeaderOverLabel: PropTypes.bool,
  fieldMessage: PropTypes.object.isRequired,
  getFieldValidator: PropTypes.func,
  containerTag: PropTypes.string.isRequired,
  containerProps: PropTypes.object.isRequired,
  headerTag: PropTypes.string,
  headerMessage: PropTypes.object,
  formName: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  placeholder: PropTypes.object
}

export default injectIntl(FormInputFieldContainer)
