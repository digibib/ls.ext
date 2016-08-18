const validators = require('./validators')

module.exports = function (form) {
  return function (values) {
    const requiredFields = Object.keys(form).filter(function (field) {
      return form[ field ].required
    })
    const errors = {}
    Object.keys(values).forEach(function (field) {
      const value = values[ field ]
      if (requiredFields.includes(field) && !value) {
        errors[ field ] = 'required'
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
    return errors
  }
}
