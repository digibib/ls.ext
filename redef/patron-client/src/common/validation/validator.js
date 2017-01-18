const validators = require('./validators')

module.exports = form => values => {
  const requiredFields = Object.keys(form).filter(field => {
    return form[ field ].required
  })
  const errors = {}
  Object.keys(form).forEach(field => {
    const value = values[ field ]
    if (requiredFields.includes(field) && !value) {
      errors[ field ] = form[field].requiredMessageOverride || 'required'
      return
    } else if (!value) {
      return
    }
    const validator = validators[ field ]
    if (validator) {
      const error = validator(value, values)
      if (error) {
        errors[ field ] = error
        return
      }
    }
  })

  // Only email is required per 18.01.17
  /* if (form.email && form.mobile && !values.email && !values.mobile) {
    errors.email = 'emailOrMobileRequired'
  } */
  return errors
}
