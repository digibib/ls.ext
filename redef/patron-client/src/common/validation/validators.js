module.exports = {
  email: email => {
    if (!/^[^@ ]+@[^@ ]+$/i.test(email)) {
      return 'invalidEmail'
    }
  },
  year: year => {
    if (year < 1900 || year > new Date().getFullYear() - 5) { /* What is the actual requirements for age? */
      return 'invalidYear'
    }
  },
  month: month => {
    if (month < 1 || month > 12) {
      return 'invalidMonth'
    }
  },
  day: day => {
    if (day < 1 || day > 31) {
      return 'invalidDay'
    }
  },
  pin: pin => {
    if (!/^\d{4}$/.test(pin)) {
      return 'invalidPin'
    }
  },
  repeatPin: (repeatPin, values) => {
    if (!values.pin) {
      return
    }
    if (!values.repeatPin) {
      return
    }
    if (values.pin !== values.repeatPin) {
      return 'pinsMustBeEqual'
    }
  },
  acceptTerms: acceptTerms => {
    if (!acceptTerms) {
      return 'termsMustBeAccepted'
    }
  }
}
