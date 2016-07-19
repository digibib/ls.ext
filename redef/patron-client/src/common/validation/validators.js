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
    if (month && (month < 1 || month > 13)) {
      return 'invalidMonth'
    }
  },
  day: (day) => {
    if (day < 1 || day > 31) {
      return 'invalidDay'
    }
  }
}