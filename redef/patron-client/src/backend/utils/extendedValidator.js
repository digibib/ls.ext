const sanitizeHtml = require('sanitize-html')

module.exports = (form) => {
  const validator = require('../../common/validation/validator')(form)
  return (values) => {
    const errors = form ? validator(values) : {}
    Object.keys(values).forEach(field => {
      const value = values[field]
      if (value && value !== sanitize(value)) {
        errors[ field ] = 'illegalCharacters'
      }
    })
    return errors
  }
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
