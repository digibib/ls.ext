import React, { PropTypes } from 'react'

import FormInputField from './FormInputField'

const FormInputFieldPlain = ({ name, message, type, headerType }) =>
  <FormInputField name={name} type={type} message={message} isLabelOverInput={false} hasLabel={false} headerType={headerType} />

export default FormInputFieldPlain
