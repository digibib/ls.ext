module.exports = {
  email: {
    required: false,
    asyncValidation: true
  },
  mobile: {
    required: false,
    asyncValidation: true
  },
  address: {
    required: true,
    asyncValidation: true
  },
  zipcode: {
    required: true,
    asyncValidation: true
  },
  city: {
    required: true,
    asyncValidation: true
  },
  /* gender: {
    required: true,
    asyncValidation: true
  }, */
  pin: {
    required: true,
    asyncValidation: true
  },
  repeatPin: {
    required: true,
    asyncValidation: false
  },
  library: {
    required: true,
    asyncValidation: true
  },
  acceptTerms: {
    required: true,
    asyncValidation: true
  }
}
