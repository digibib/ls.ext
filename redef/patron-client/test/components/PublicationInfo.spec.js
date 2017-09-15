/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import {IntlProvider} from 'react-intl'
import PublicationInfo, {__RewireAPI__ as DefaultExportPublicationInfoRewireApi} from '../../src/frontend/components/PublicationInfo'
import {Provider} from 'react-redux'
import rootReducer from '../../src/frontend/reducers'
import {createStore} from 'redux'

function setup (propOverrides) {
  const props = {
    publication: {
      id: 'test_id',
      uri: 'test_uri',
      items: [],
      formatAdaptations: [],
      publishers: [],
      subtitles: [],
      serialIssues: [],
      notes: [],
      extents: [],
      numberOfPages: []
    },
    expandSubResource: expect.createSpy(),
    startReservation: () => {},
    ...propOverrides
  }
  const store = createStore(rootReducer, { modal: props })

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en">
        <PublicationInfo {...props} />
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
  before(() => {
    DefaultExportPublicationInfoRewireApi.__Rewire__('Items', () => <table />)
  })

  after(() => {
    DefaultExportPublicationInfoRewireApi.__ResetDependency__('Items')
  })

  describe('PublicationInfo', () => {
    it('should render', () => {
      const { node } = setup()
      expect(node).toNotEqual(null)
    })
  })
})
