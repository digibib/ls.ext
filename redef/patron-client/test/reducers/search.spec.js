/* eslint-env mocha */
import expect from 'expect'
import search from '../../src/frontend/reducers/search'
import * as types from '../../src/frontend/constants/ActionTypes'

describe('reducers', () => {
  describe('search', () => {
    it('should handle initial state', () => {
      expect(
        search(undefined, {})
      ).toEqual({
        searchResults: [],
        filtersByQuery: {},
        filters: [],
        isSearching: false,
        totalHits: 0,
        totalHitsPublications: 0,
        searchError: false,
        inputQuery: '',
        displaySearchBar: true
      })
    })

    it(`should handle ${types.REQUEST_SEARCH}`, () => {
      expect(
        search({}, {
          type: types.REQUEST_SEARCH,
          payload: {
            inputQuery: 'inputQuery'
          }
        })
      ).toEqual({
        isSearching: true,
        inputQuery: 'inputQuery'
      })
    })

    it(`should handle ${types.RECEIVE_SEARCH}`, () => {
      expect(
        search({}, {
          type: types.RECEIVE_SEARCH,
          payload: {
            searchResults: 'searchResults',
            totalHits: 'totalHits',
            totalHitsPublications: 'totalHitsPublications',
            filters: 'filters'
          }
        })
      ).toEqual({
        isSearching: false,
        searchError: false,
        searchResults: 'searchResults',
        totalHits: 'totalHits',
        totalHitsPublications: 'totalHitsPublications',
        filters: 'filters'
      })
    })

    it(`should handle ${types.SEARCH_FAILURE}`, () => {
      expect(
        search({}, {
          type: types.SEARCH_FAILURE,
          payload: {
            message: 'message'
          },
          error: true
        })
      ).toEqual({
        searchError: 'message',
        isSearching: false
      })
    })
  })
})
