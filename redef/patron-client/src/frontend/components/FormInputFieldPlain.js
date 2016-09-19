import React, { PropTypes } from 'react'

import FormInputField from './FormInputField'

const FormInputFieldPlain = ({ name, message, type, headerType, formName }) =>
  <FormInputField name={name} type={type} message={message}
                  headerType={headerType} formName={formName} />

FormInputFieldPlain.propTypes = {
  name: PropTypes.string.isRequired,
  message: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  headerType: PropTypes.string.isRequired,
  formName: PropTypes.string.isRequired
}

export default FormInputFieldPlain
