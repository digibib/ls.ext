module.exports = {
  email: (email) => {
    if (!/^[^@ ]+@[^@ ]+$/i.test(email)) {
      return 'invalidEmail'
    }
  },
  year: (year) => {
    if (year < 1900 || year > new Date().getFullYear() - 5) { /* What is the actual requirements for age? */
      return 'invalidYear'
    }
  },
  month: (month) => {
    if (month < 1 || month > 12) {
      return 'invalidMonth'
    }
  },
  day: (day) => {
    if (day < 1 || day > 31) {
      return 'invalidDay'
    }
  },
  repeatPin: (repeatPin, values) => {
    if ((values.newPin && repeatPin !== values.newPin) || (values.pin && repeatPin !== values.pin)) {
      return 'pinsMustBeEqual'
    }
  }
}
