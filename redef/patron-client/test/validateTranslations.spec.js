/* eslint-env mocha */
import expect from 'expect'
const validator = require('./validateTranslations')

describe('translation validation', () => {
  it('should return true if all english messages have norwegian counterparts, and all norwegian translations are in use', () => {
    expect(validator.validate()).toEqual(true)
  })
})
