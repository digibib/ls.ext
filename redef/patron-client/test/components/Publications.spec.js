/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Publications, { __RewireAPI__ as DefaultExportPublicationsRewireApi } from '../../src/frontend/components/Publications'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    expandSubResource: () => {},
    startReservation: () => {},
    toggleFilter: () => {},
    toggleParameterValue: () => {},
    removePeriod: () => {},
    locationQuery: {},
    audiences: [],

    publications: [
      {
        uri: '/publication_id1',
        id: 'publication_id1',
        mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
        languages: [],
        formats: []
      },
      {
        uri: '/publication_id2',
        id: 'publication_id2',
        mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
        languages: [],
        formats: []
      },
      {
        uri: '/publication_id3',
        id: 'publication_id3',
        mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
        languages: [],
        formats: []
      },
      {
        uri: '/publication_id4',
        id: 'publication_id4',
        mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
        languages: [],
        formats: []
      },
      {
        uri: '/publication_id5',
        id: 'publication_id5',
        mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
        languages: [],
        formats: []
      }
    ],
    searchFilterActions: {
      removePeriod: () => {},
      removeFilterInBackUrl: () => {},
      removePeriodInBackUrl: () => {}

    },
    query: {},
    workLanguage: '',
    ...propOverrides
  }

  const messages = {
    'http://lexvo.org/id/iso639-3/nob': 'Norwegian',
    'http://lexvo.org/id/iso639-3/swe': 'Swedish',
    'http://lexvo.org/id/iso639-3/eng': 'English',
    'http://lexvo.org/id/iso639-3/dan': 'Danish',
    'http://lexvo.org/id/iso639-3/cze': 'Czech',
    'http://lexvo.org/id/iso639-3/bur': 'Burmese',
    'http://data.deichman.no/format#Book': 'Book',
    'http://data.deichman.no/format#CD-ROM': 'CD-ROM',
    'http://data.deichman.no/mediaType#Book': 'Book',
    'http://data.deichman.no/mediaType#MusicRecording': 'Music recording',
    'http://data.deichman.no/mediaType#Game': 'Game',
    'Publications.noMediaType': 'Uncategorized'
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <Publications {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportPublicationsRewireApi.__Rewire__('Publication', ({ publication }) => (
      <div data-automation-id={`publication_${publication.uri}`} />
    ))
  })

  after(() => {
    DefaultExportPublicationsRewireApi.__ResetDependency__('Publication')
  })

  describe('Publications', () => {
    it('should render empty when no publications', () => {
      const { node } = setup({ publications: [] })
      expect(node.getAttribute('data-automation-id')).toBe('no_publications')
    })

    it('should render publications', () => {
      const { node, props } = setup({ mediaQueryValues: { width: 992 } })
      expect(node.querySelectorAll("[data-automation-id^='publication_']").length).toBe(props.publications.length)
    })

    it('should render row for every three publications on desktop screens', () => {
      const { node } = setup({ mediaQueryValues: { width: 992 } })
      expect(node.getElementsByClassName('row').length).toBe(2)
    })

    it('should render row for every two publications on tablets', () => {
      const { node } = setup({ mediaQueryValues: { width: 668 } })
      expect(node.getElementsByClassName('row').length).toBe(3)
    })

    it('should render row for every single publications on mobile', () => {
      const { node } = setup({ mediaQueryValues: { width: 667 } })
      expect(node.getElementsByClassName('row').length).toBe(5)
    })

    it('should group publications by media type', () => {
      const { node } = setup({
        mediaQueryValues: { width: 992 },
        publications: [
          {
            uri: '/publication_id1',
            id: 'publication_id1',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [],
            formats: []
          },
          {
            uri: '/publication_id2',
            id: 'publication_id2',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [],
            formats: []
          },
          {
            uri: '/publication_id3',
            id: 'publication_id3',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [],
            formats: []
          },
          {
            uri: '/publication_id4',
            id: 'publication_id4',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book', 'http://data.deichman.no/mediaType#Game' ],
            languages: [],
            formats: []
          },
          {
            uri: '/publication_id5',
            id: 'publication_id5',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Game' ],
            languages: [],
            formats: []
          },
          {
            uri: '/publication_id6',
            id: 'publication_id6',
            mediaTypes: [ 'http://data.deichman.no/mediaType#MusicRecording' ],
            languages: [],
            formats: []
          },
          {
            uri: '/publication_id7',
            id: 'publication_id7',
            mediaTypes: [ ],
            languages: [],
            formats: []
          }
        ]
      })
      const mediaTypeGroups = node.querySelectorAll("[data-automation-id='mediaType_group']")
      expect(mediaTypeGroups.length).toBe(4)
      expect(node.querySelectorAll("[data-mediatype$='Book']").length).toBe(1)
      expect(node.querySelector("[data-mediatype$='Book']").querySelectorAll("[data-automation-id^='publication_']").length).toBe(4)
      expect(node.querySelectorAll("[data-mediatype$='Game']").length).toBe(1)
      expect(node.querySelector("[data-mediatype$='Game']").querySelectorAll("[data-automation-id^='publication_']").length).toBe(2)
      expect(node.querySelectorAll("[data-mediatype$='MusicRecording']").length).toBe(1)
      expect(node.querySelector("[data-mediatype$='MusicRecording']").querySelectorAll("[data-automation-id^='publication_']").length).toBe(1)
      expect(node.querySelectorAll("[data-mediatype$='noMediaType']").length).toBe(1)
      expect(node.querySelector("[data-mediatype$='noMediaType']").querySelectorAll("[data-automation-id^='publication_']").length).toBe(1)
    })

    it('should sort publications by language, publication year and format', () => {
      const { node } = setup({
        mediaQueryValues: { width: 992 },
        publications: [
          {
            uri: '/uri1',
            id: 'publication_id1',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/cze' ],
            publicationYear: '1000',
            formats: [ 'http://data.deichman.no/format#Book' ]
          },
          {
            uri: '/uri2',
            id: 'publication_id2',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/bur' ],
            publicationYear: '2000',
            formats: [ 'http://data.deichman.no/format#CD-ROM' ]
          },
          {
            uri: '/uri3',
            id: 'publication_id3',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/cze' ],
            publicationYear: '2000',
            formats: [ 'http://data.deichman.no/format#CD-ROM' ]
          },
          {
            uri: '/uri4',
            id: 'publication_id4',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/cze' ],
            publicationYear: '1000',
            formats: [ 'http://data.deichman.no/format#CD-ROM' ]
          },
          {
            uri: '/uri5',
            id: 'publication_id5',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/cze' ],
            publicationYear: '2000',
            formats: [ 'http://data.deichman.no/format#Book' ]
          }
        ]
      })
      const publications = node.querySelectorAll("[data-automation-id^='publication_']")
      expect(publications.length).toBe(5)
      expect(publications[ 0 ].getAttribute('data-automation-id')).toEqual('publication_/uri2')
      expect(publications[ 1 ].getAttribute('data-automation-id')).toEqual('publication_/uri5')
      expect(publications[ 2 ].getAttribute('data-automation-id')).toEqual('publication_/uri3')
      expect(publications[ 3 ].getAttribute('data-automation-id')).toEqual('publication_/uri1')
      expect(publications[ 4 ].getAttribute('data-automation-id')).toEqual('publication_/uri4')
    })

    it('should prioritize Norwegian, English, Swedish and Danish when sorting by language', () => {
      const { node } = setup({
        mediaQueryValues: { width: 992 },
        publications: [
          {
            uri: '/uri1',
            id: 'publication_id1',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/eng' ],
            formats: []
          },
          {
            uri: '/uri2',
            id: 'publication_id2',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/bur' ],
            formats: []
          },
          {
            uri: '/uri3',
            id: 'publication_id3',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/nob' ],
            formats: []
          },
          {
            uri: '/uri4',
            id: 'publication_id4',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/dan' ],
            formats: []
          },
          {
            uri: '/uri5',
            id: 'publication_id5',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/cze' ],
            formats: []
          },
          {
            uri: '/uri6',
            id: 'publication_id6',
            mediaTypes: [ 'http://data.deichman.no/mediaType#Book' ],
            languages: [ 'http://lexvo.org/id/iso639-3/swe' ],
            formats: []
          }
        ]
      })
      const publications = node.querySelectorAll("[data-automation-id^='publication_']")
      expect(publications.length).toBe(6)
      expect(publications[ 0 ].getAttribute('data-automation-id')).toEqual('publication_/uri3')
      expect(publications[ 1 ].getAttribute('data-automation-id')).toEqual('publication_/uri1')
      expect(publications[ 2 ].getAttribute('data-automation-id')).toEqual('publication_/uri6')
      expect(publications[ 3 ].getAttribute('data-automation-id')).toEqual('publication_/uri4')
      expect(publications[ 4 ].getAttribute('data-automation-id')).toEqual('publication_/uri2')
      expect(publications[ 5 ].getAttribute('data-automation-id')).toEqual('publication_/uri5')
    })
  })
})
