/* eslint-env mocha */
import expect from 'expect'
import { buildQuery, translateFieldTerms } from '../../src/backend/utils/searchBuilder'
import { defaultFields } from '../../src/backend/utils/queryConstants'

describe('searchBuilder', () => {
  describe('building query', () => {
    it('translates field qualificators', () => {
      const translations = {
        'forf': 'author',
        'tittel': 'title',
        'tag': 'subject'
      }
      const tests = [
        ['', ''],
        ['*', '*'],
        ['hei', 'hei'],
        ['abc æøå "123"', 'abc æøå "123"'],
        ['year:1999', 'year:1999'],
        ['forf:hamsun', 'author:hamsun'],
        ['forf:"Knut Hamsun"', 'author:"Knut Hamsun"'],
        ['forf:"Knut Hamsun" sult', 'author:"Knut Hamsun" sult'],
        ['forf:hamsun sult', 'author:hamsun sult'],
        ['tittel:"slaktehus 55" tag:sf', 'title:"slaktehus 55" subject:sf'],
        ['title:"forf: hamsun"', 'title:"forf: hamsun"']
      ]
      tests.forEach(test => {
        expect(translateFieldTerms(test[0], translations)).toEqual(test[1])
      })
    })

    it('should build simple query', () => {
      const urlQueryString = 'query=some+strings'
      const queryWant = 'some strings'
      const q = buildQuery(urlQueryString).query
      expect(q).toEqual(
        {
          bool: {
            must: [
              {
                simple_query_string: {
                  default_operator: 'and',
                  fields: defaultFields,
                  query: queryWant
                }
              }
            ]
          }
        })
    })

    it('should build advanced query', () => {
      const urlQueryString = 'query=author%3A+Hamsun'
      const queryWant = 'author: Hamsun'
      const q = buildQuery(urlQueryString).query
      expect(q).toEqual(
        {
          bool: {
            must: [
              {
                query_string: {
                  default_operator: 'and',
                  query: queryWant
                }
              }
            ]
          }
        })
    })

    it('should build an isbn field query from an isbn query string', () => {
      const urlQueryString = 'query=82-05-30003-8'
      const q = buildQuery(urlQueryString).query
      expect(q).toEqual(
        {
          bool: {
            must: [
              {
                query_string: {
                  default_operator: 'or',
                  query: 'isbn:82-05-30003-8'
                }
              }
            ]
          }
        })
    })
  })

  describe('aggregations', () => {
    const urlQueryString = 'filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske&yearFrom=1980&yearTo=1990'
    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      const q = buildQuery(urlQueryString)
      expect(q.aggs.facets.aggs[ 'audiences' ].filter.bool.must).toEqual(
        [
          {
            'simple_query_string': {
              'default_operator': 'and',
              'fields': defaultFields,
              'query': 'fiske'
            }
          },
          {
            'range': {
              'publicationYear': {
                'gte': 1980,
                'lte': 1990
              }
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

    it('should include activated filters in aggregations, excluding filters of the given aggregation II', () => {
      const q = buildQuery(urlQueryString)
      expect(q.aggs.facets.aggs[ 'branches' ].filter.bool.must).toEqual(
        [
          {
            'simple_query_string': {
              'default_operator': 'and',
              'fields': defaultFields,
              'query': 'fiske'
            }
          },
          {
            'range': {
              'publicationYear': {
                'gte': 1980,
                'lte': 1990
              }
            }
          },
          {
            'terms': {
              'audiences': [ 'http://data.deichman.no/audience#juvenile' ]
            }
          }
        ]
      )
    })

    it('should include publicationYear range filter', () => {
      const q = buildQuery(urlQueryString)
      expect(q.query.bool.must).toInclude(
        {
          'range': {
            'publicationYear': {
              'gte': 1980,
              'lte': 1990
            }
          }
        }
      )
    })
  })
})
