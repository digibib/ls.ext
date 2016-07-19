const sanitizeHtml = require('sanitize-html')
const validators = require('../../common/validation/validators')

module.exports = (values, requiredFields = []) => {
  const errors = {}
  Object.keys(values).forEach(field => {
    const value = values[ field ]
    if(requiredFields[field] && !value) {
      errors[ field ] = 'required'
    } else if(!value) {
      return
    }
    if (value != sanitize(value)) {
      errors[ field ] = 'illegalCharacters'
      return
    }
    const validator = validators[ field ]
    if(validator) {
      const error = validator(value)
      if(error) {
        errors[ field ] = validator(value)
        return
      }
    }
  })
  return errors
}

function sanitize (dirtyInput) {
  // TODO: Fix. mysql.escape returns quoted output
  // return mysql.escape(sanitizeHtml(dirtyInput, {
  //   allowedTags: []
  // }))
  return sanitizeHtml(dirtyInput, {
    allowedTags: []
  })
}