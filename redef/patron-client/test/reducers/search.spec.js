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
        searchQuery: '',
        isSearching: false,
        isRequestingAggregation: false,
        totalHits: 0,
        isError: false
      })
    })

    it('should handle ' + types.REQUEST_SEARCH, () => {
      expect(
        search({}, {
          type: types.REQUEST_SEARCH,
          payload: {
            inputQuery: 'inputQuery',
            elasticSearchQuery: 'elasticSearchQuery'
          }
        })
      ).toEqual({
        isSearching: true,
        inputQuery: 'inputQuery',
        elasticSearchQuery: 'elasticSearchQuery'
      })
    })

    it('should handle ' + types.RECEIVE_SEARCH, () => {
      expect(
        search({}, {
          type: types.RECEIVE_SEARCH,
          payload: {
            searchResults: 'searchResults',
            totalHits: 'totalHits'
          }
        })
      ).toEqual({
        isSearching: false,
        isError: false,
        searchResults: 'searchResults',
        totalHits: 'totalHits'
      })
    })

    it('should handle ' + types.RECEIVE_AGGREGATION, () => {
      expect(
        search({}, {
          type: types.RECEIVE_AGGREGATION,
          payload: {
            filters: 'filters',
            inputQuery: 'inputQuery'
          }
        })
      ).toEqual({
        filtersByQuery: { 'inputQuery': 'filters' },
        isRequestingAggregation: false
      })

      expect(
        search({
          filtersByQuery: { 'existing': 'existing filters' }
        }, {
          type: types.RECEIVE_AGGREGATION,
          payload: {
            filters: 'new filters',
            inputQuery: 'new query'
          }
        })
      ).toEqual({
        filtersByQuery: { existing: 'existing filters', 'new query': 'new filters' },
        isRequestingAggregation: false
      })
    })

    it('should handle ' + types.REQUEST_AGGREGATION, () => {
      expect(
        search({}, {
          type: types.REQUEST_AGGREGATION
        })
      ).toEqual({
        isRequestingAggregation: true
      })
    })

    it('should handle ' + types.SEARCH_FAILURE, () => {
      expect(
        search({}, {
          type: types.SEARCH_FAILURE
        })
      ).toEqual({
        isSearching: false,
        isError: true
      })
    })
  })
})