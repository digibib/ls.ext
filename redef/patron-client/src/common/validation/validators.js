module.exports = {
  email: function (email) {
    if (!/^[^@ ]+@[^@ ]+$/i.test(email)) {
      return 'invalidEmail'
    }
  },
  year: function (year) {
    if (year < 1900 || year > new Date().getFullYear() - 5) { /* What is the actual requirements for age? */
      return 'invalidYear'
    }
  },
  month: function (month) {
    if (month < 1 || month > 12) {
      return 'invalidMonth'
    }
  },
  day: function (day) {
    if (day < 1 || day > 31) {
      return 'invalidDay'
    }
  },
  pin: function (pin) {
    if (!/^\d{4}$/.test(pin)) {
      return 'invalidPin'
    }
  },
  repeatPin: function (repeatPin, values) {
    if (!values.pin) {
      return
    }
    if (!values.repeatPin) {
      return
    }
    if (values.pin !== values.repeatPin) {
      return 'pinsMustBeEqual'
    }
  }
}
