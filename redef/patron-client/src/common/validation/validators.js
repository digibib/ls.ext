module.exports = {
  email: email => {
    if (!/^[^@ ]+@[^@ ]+$/i.test(email)) {
      return 'invalidEmail'
    }
  },
  ssn: ssn => {
    if (!/^\d{11,12}$/.test(ssn) || !validateSSN(ssn.toString())) {
      console.log('invalid SSN')
      return 'invalidSSN'
    }
  },
  zipcode: zipcode => {
    if (!/^\d{4}$/.test(zipcode)) {
      return 'invalidZipcode'
    }
  },
  mobile: mobile => {
    if (!/^((0047)?|(\+47)?|(47)?)\d{8}$/.test(mobile)) {
      return 'invalidPhoneNumber'
    }
  },
  city: city => {
    if (!/^[A-Za-z-øæåÆØÅ]{2,}$/.test(city)) {
      return 'invalidCity'
    }
  },
  year: year => {
    if (!/^\d{4}$/.test(year) || year < 1900 || year > new Date().getFullYear() - 5) { /* What is the actual requirements for age? */
      return 'invalidYear'
    }
  },
  month: month => {
    if (!/^\d{1,2}$/.test(month) || month < 1 || month > 12) {
      return 'invalidMonth'
    }
  },
  day: day => {
    if (!/^\d{1,2}$/.test(day) || day < 1 || day > 31) {
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

function validateSSN (ssn) {
  if (ssn.length === 11) {
    return validateFNumber(ssn) || validateDNumber(ssn) || validateSNumber(ssn) || validateVGONumber(ssn)
  } else if (ssn.length === 12) {
    return validateDUFNumber(ssn)
  } else {
    return false
  }
}

function validateFNumber (ssn) {
  if (parseInt(ssn.charAt(0)) > 3) {
    return false
  } else if (parseInt(ssn.charAt(2)) > 1) {
    return false
  } else {
    return isValidFNumberChecksum(ssn)
  }
}

function isValidFNumberChecksum (ssn) {
  let digits = []
  for (let i = 0; i < ssn.length; i++) {
    digits.push(parseInt(ssn.charAt(i)))
  }
  const ctrl = (3 * digits[ 0 ] + 7 * digits[ 1 ] + 6 * digits[ 2 ] + digits[ 3 ] + 8 * digits[ 4 ]
    + 9 * digits[ 5 ] + 4 * digits[ 6 ] + 5 * digits[ 7 ] + 2 * digits[ 8 ] ) % 11
  let controlDigit1 = 0
  if (ctrl !== 0) {
    controlDigit1 = 11 - ctrl
  }
  if (controlDigit1 === 10) {
    return false
  }
  const ctrl2 = (5 * digits[ 0 ] + 4 * digits[ 1 ] + 3 * digits[ 2 ] + 2 * digits[ 3 ] + 7 * digits[ 4 ]
    + 6 * digits[ 5 ] + 5 * digits[ 6 ] + 4 * digits[ 7 ] + 3 * digits[ 8 ] + 2 * controlDigit1) % 11
  let controlDigit2 = 0
  if (ctrl2 !== 0) {
    controlDigit2 = 11 - ctrl
  }
  if (controlDigit2 === 10) {
    return false
  }
  return controlDigit1 === digits[ 9 ] && controlDigit2 === digits[ 10 ]
}

function validateDNumber (ssn) {
  if (parseInt(ssn.charAt(0)) > 7 || parseInt(ssn.charAt(0) < 4)) {
    return false
  } else if (parseInt(ssn.charAt(2)) > 1) {
    return false
  } else {
    return isValidFNumberChecksum(ssn)
  }
}

function validateDUFNumber (ssn) {
  const control = parseInt(ssn.substring(10))
  const d_digits = ssn.substring(0, 10)
  const multipliers = [ 4, 6, 3, 2, 7, 5, 4, 6, 3, 2 ]

  let temp = 0
  for (let i = 9; i >= 0; i--) {
    temp += multipliers[ i ] * d_digits[ i ]
  }

  temp = temp % 11

  return temp === control
}

function validateSNumber (ssn) {

}

function validateVGONumber (ssn) {

}
