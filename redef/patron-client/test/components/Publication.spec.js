/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import Publication from '../../src/frontend/components/Publication'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import * as LoginActions from '../../src/frontend/actions/LoginActions'

function setup (propOverrides) {
  const props = {
    expandSubResource: () => {},
    startReservation: () => {},
    publication: {
      id: 'test_id',
      mainTitle: 'test_maintitle',
      publicationYear: 'test_publicationYear',
      languages: [ 'test_language' ],
      formats: [ 'test_format' ],
      items: [],
      available: true,
      mediaTypes: []
    },
    ...propOverrides
  }

  const messages = {
    'test_format': 'test_format_english',
    'test_language': 'test_language_english'
  }

  const store = createStore(rootReducer)
  store.dispatch(LoginActions.loginSuccess('test_username', 'test_borrowernumber', 'test_borrowerName', 'test_category'))

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <Publication {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Publication', () => {
    it('should render the publication with title, year, language, format and item count', () => {
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='publication_title']").textContent).toBe(props.publication.mainTitle)
      expect(node.querySelector("[data-automation-id='publication_year']").textContent).toBe(props.publication.publicationYear)
      expect(node.querySelector("[data-automation-id='publication_languages']").textContent).toBe(`${props.publication.languages[ 0 ]}_english`)
      expect(node.querySelector("[data-automation-id='publication_available']").textContent).toBe('Available')
      expect(node.querySelector("[data-automation-id='publication_formats']").textContent).toBe(`${props.publication.formats[ 0 ]}_english`)
    })

    it('should combine main title and part title as title', () => {
      const { node, props } = setup({
        publication: {
          mainTitle: 'test_maintitle',
          partTitle: 'test_parttitle',
          formats: [],
          languages: [],
          items: [],
          mediaTypes: []
        }
      })
      expect(node.querySelector("[data-automation-id='publication_title']").textContent).toBe(`${props.publication.mainTitle}. ${props.publication.partTitle}`)
    })
  })
})
