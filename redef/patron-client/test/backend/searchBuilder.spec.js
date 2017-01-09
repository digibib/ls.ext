/* eslint-env mocha */
import expect from 'expect'
import {buildQuery} from '../../src/backend/utils/searchBuilder'

describe('searchBuilder', () => {
  describe('building query', () => {
    it('should build simple query', () => {
      const queryString = 'query=some+strings'
      const queryWant = 'some strings'
      expect(buildQuery(queryString).query).toEqual(
        {
          filtered: {
            filter: {
              bool: {
                must: []
              }
            },
            query: {
              bool: {
                filter: [
                  {
                    simple_query_string: {
                      query: queryWant,
                      default_operator: 'and',
                      fields: [ 'mainTitle^2', 'partTitle', 'subject', 'agents^2', 'genre', 'series', 'format', 'mt', 'title' ]
                    }
                  }
                ],
                must: []
              }
            }
          }
        })
    })

    it('should build advanced query', () => {
      const queryString = 'query=author%3A+Hamsun'
      const queryWant = 'author: Hamsun'
      expect(buildQuery(queryString).query).toEqual(
        {
          filtered: {
            filter: {
              bool: {
                must: []
              }
            },
            query: {
              query_string: {
                query: queryWant,
                default_operator: 'and'
              }
            }
          }
        })
    })
  })

  describe('filters', () => {
    it('should parse filters and use in query', () => {
      const urlQueryString = 'filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske'
      expect(buildQuery(urlQueryString).query.filtered.filter.bool.must).toEqual(
        [
          {
            'terms': {
              'audiences': [ 'http://data.deichman.no/audience#juvenile' ]
            }
          },
          {
            'terms': {
              'branches': [ 'flam', 'fmaj', 'ftor' ]
            }
          }
        ]
      )
    })
  })

  describe('aggregations', () => {
    const urlQueryString = 'filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske'
    const query = buildQuery(urlQueryString)

    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      expect(query.aggs.facets.aggs[ 'audiences' ].filter.bool.must).toEqual(
        [
          {
            'terms': {
              'branches': [ 'flam', 'fmaj', 'ftor' ]
            }
          }
        ]
      )
    })

    it('should include activated filters in aggregations, excluding filters of the given aggregation II', () => {
      expect(query.aggs.facets.aggs[ 'branches' ].filter.bool.must).toEqual(
        [
          {
            'terms': {
              'audiences': [ 'http://data.deichman.no/audience#juvenile' ]
            }
          }
        ]
      )
    })
  })
})
