/* eslint-env mocha */
import expect from 'expect'
import { buildQuery, translateFieldTerms } from '../../src/backend/utils/searchBuilder'

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

    // it('should build simple query', () => {
    //   const queryString = 'query=some+strings'
    //   const queryWant = 'some strings'
    //   expect(buildQuery(queryString).query).toEqual(
    //     {
    //       filtered: {
    //         filter: {
    //           bool: {
    //             must: []
    //           }
    //         },
    //         query: {
    //           bool: {
    //             filter: [
    //               {
    //                 simple_query_string: {
    //                   query: queryWant,
    //                   default_operator: 'and',
    //                   fields: ['mainTitle^2', 'partTitle', 'subject', 'agents^2', 'genre', 'series', 'format', 'mt', 'title' ]
    //                 }
    //               }
    //             ],
    //             must: []
    //           }
    //         }
    //       }
    //     })
    // })

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
    const urlQueryString = 'filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske&yearFrom=1980&yearTo=1990'
    const query = buildQuery(urlQueryString)

    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      expect(query.aggs.facets.aggs[ 'audiences' ].filter.bool.must).toEqual(
        [
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
      expect(query.aggs.facets.aggs[ 'branches' ].filter.bool.must).toEqual(
        [
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
      expect(query.query.filtered.filter.bool.must).toInclude(
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
