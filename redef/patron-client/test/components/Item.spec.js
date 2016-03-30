/* global describe, it */
// Test of shallow rendering, without any supporting libraries.
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import { IntlProvider } from 'react-intl'
import Item from '../../src/frontend/components/Item'

function setup (props) {
  let renderer = TestUtils.createRenderer()
  let intlProvider = new IntlProvider({ locale: 'en', defaultLocale: 'en' }, {})
  renderer.render(<Item {...props} />, intlProvider.getChildContext())
  let output = renderer.getRenderOutput()
  return {
    props,
    output,
    renderer
  }
}

describe('components', () => {
  describe('Item', () => {
    it('should render one unavailable item', () => {
      const { output } = setup({
        item: {
          title: 'title',
          language: 'language',
          format: 'format',
          barcode: 'barcode',
          location: 'location',
          status: 'status',
          shelfmark: 'shelfmark'
        }
      })

      expect(output.type).toBe('tr')
      expect(output.props.about).toBe('barcode')

      let [ title, language, format, barcode, location, status, shelfmark ] = output.props.children

      expect(title.type).toBe('td')
      expect(title.props.children).toBe('title')
      expect(language.type).toBe('td')
      expect(language.props.children).toBe('language')
      expect(format.type).toBe('td')
      expect(format.props.children).toBe('format')
      expect(barcode.type).toBe('td')
      expect(barcode.props.children).toBe('barcode')
      expect(location.type).toBe('td')
      expect(location.props.children).toBe('location')
      expect(status.type).toBe('td')
      expect(status.props.children.type).toBe('span')
      expect(status.props.children.props.children.props.id).toBe('Item.expectedAvailable')
      expect(shelfmark.type).toBe('td')
      expect(shelfmark.props.children).toBe('shelfmark')
    })

    it('should render one available item', () => {
      const { output } = setup({
        item: {
          title: 'title',
          language: 'language',
          format: 'format',
          barcode: 'barcode',
          location: 'location',
          status: 'AVAIL',
          shelfmark: 'shelfmark'
        }
      })
      expect(output.type).toBe('tr')
      expect(output.props.about).toBe('barcode')

      let [ title, language, format, barcode, location, status, shelfmark ] = output.props.children
      expect(title.type).toBe('td')
      expect(title.props.children).toBe('title')
      expect(language.type).toBe('td')
      expect(language.props.children).toBe('language')
      expect(format.type).toBe('td')
      expect(format.props.children).toBe('format')
      expect(barcode.type).toBe('td')
      expect(barcode.props.children).toBe('barcode')
      expect(location.type).toBe('td')
      expect(location.props.children).toBe('location')
      expect(status.type).toBe('td')
      expect(status.props.children.type).toBe('span')
      expect(status.props.children.props.children.props.id).toBe('Item.available')
      expect(shelfmark.type).toBe('td')
      expect(shelfmark.props.children).toBe('shelfmark')
    })
  })
})
