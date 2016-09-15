/* eslint-env mocha */
import expect from 'expect'
const validator = require('./validateTranslations')

function setup () {
  validator.validate()
}

describe('translation validation', () => {
  setup()
  it('should return true if all english messages have norwegian counterparts, and all norwegian translations are in use', () => {
    expect(validator.hasUntranslatedMessages).toEqual(true)
  })
})
