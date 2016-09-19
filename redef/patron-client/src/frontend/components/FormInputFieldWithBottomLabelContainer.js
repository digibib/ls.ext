import React, { PropTypes } from 'react'

import FormInputFieldContainer from './FormInputFieldContainer'

const FormInputFieldWithBottomLabelContainer =
  ({ fieldName, fieldType, fieldHeaderType, fieldMessage, containerTag, containerProps, getFieldValidator, headerTag, headerMessage, formName }) =>
    <FormInputFieldContainer fieldName={fieldName} fieldType={fieldType} hasFieldLabel={true}
                             fieldHeaderType={fieldHeaderType}
                             isFieldHeaderOverLabel="" fieldMessage={fieldMessage} containerTag={containerTag}
                             containerProps={containerProps}
                             getFieldValidator={getFieldValidator} headerMessage={headerMessage}
                             headerTag={headerTag} formName={formName} />

FormInputFieldWithBottomLabelContainer.propTypes = {
  fieldName: PropTypes.string.isRequired,
  fieldType: PropTypes.string.isRequired,
  fieldHeaderType: PropTypes.string.isRequired,
  fieldMessage: PropTypes.object.isRequired,
  getFieldValidator: PropTypes.func,
  containerTag: PropTypes.string.isRequired,
  containerProps: PropTypes.object.isRequired,
  headerTag: PropTypes.string,
  headerMessage: PropTypes.object,
  formName: PropTypes.string.isRequired
}

export default FormInputFieldWithBottomLabelContainer
