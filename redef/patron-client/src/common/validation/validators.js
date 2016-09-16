module.exports = {
  email: email => {
    if (!/^[^@ ]+@[^@ ]+$/i.test(email)) {
      return 'invalidEmail'
    }
  },
  ssn: ssn => {
    if (!validateSSN(ssn)) {
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
  const stringSSN = ssn.toString()
  if (parseInt(stringSSN.charAt(0)) > 3) {
    return false
  } else if (parseInt(stringSSN.charAt(2)) > 1) {
    return false
  }
}

function validateDNumber (ssn) {

}

function validateDUFNumber (ssn) {

}

function validateSNumber (ssn) {

}

function validateVGONumber (ssn) {

}
