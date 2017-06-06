/* eslint-env mocha */
import expect from 'expect'
import {buildQuery, translateFieldTerms} from '../../src/backend/utils/searchBuilder'
import {defaultPublicationFields, defaultWorkFields} from '../../src/backend/utils/queryConstants'

function advancedQuery (queryWant, boolOpeator) {
  boolOpeator = boolOpeator || 'and'
  return {
    bool: {
      should: [
        {
          has_child: {
            score_mode: 'max',
            type: 'publication',
            query: {
              function_score: {
                boost: 10,
                query: {
                  bool: {
                    must: [
                      {
                        query_string: {
                          query: queryWant,
                          default_operator: boolOpeator
                        }
                      } ],
                    filter: []
                  }
                },
                script_score: {
                  script: {
                    inline: 'deleted',
                    lang: 'painless'
                  }
                }
              }
            },
            inner_hits: {
              size: 100,
              name: 'publications',
              explain: false
            }
          }
        },
        {
          bool: {
            must: [
              {
                has_child: {
                  query: {
                    function_score: {
                      boost: 10,
                      query: {
                        bool: {
                          should: {
                            match_all: {}
                          },
                          filter: []
                        }
                      },
                      script_score: {
                        script: {
                          inline: 'deleted',
                          lang: 'painless'
                        }
                      }
                    }
                  },
                  score_mode: 'max',
                  inner_hits: {
                    name: 'publications',
                    size: 100,
                    explain: false
                  },
                  type: 'publication'
                }
              },
              {
                query_string: {
                  query: queryWant,
                  default_operator: boolOpeator
                }
              }
            ],
            filter: []
          }
        }
      ]
    }
  }
}

describe('searchBuilder', () => {
  describe('building query', () => {
    it('translates field qualificators', () => {
      const translations = {
        'forf': 'author',
        'tittel': 'title',
        'tag': 'subject'
      }
      const tests = [
        [ '', '' ],
        [ '*', '*' ],
        [ 'hei', 'hei' ],
        [ 'abc æøå "123"', 'abc æøå "123"' ],
        [ 'year:1999', 'year:1999' ],
        [ 'forf:hamsun', 'author:hamsun' ],
        [ 'forf:"Knut Hamsun"', 'author:"Knut Hamsun"' ],
        [ 'forf:"Knut Hamsun" sult', 'author:"Knut Hamsun" sult' ],
        [ 'forf:hamsun sult', 'author:hamsun sult' ],
        [ 'tittel:"slaktehus 55" tag:sf', 'title:"slaktehus 55" subject:sf' ],
        [ 'title:"forf: hamsun"', 'title:"forf: hamsun"' ]
      ]
      tests.forEach(test => {
        expect(translateFieldTerms(test[ 0 ], translations)).toEqual(test[ 1 ])
      })
    })

    it('should build simple query', () => {
      const urlQueryString = 'query=some+strings'
      const queryWant = 'some strings'
      const q = buildQuery(urlQueryString).query
      q.bool.should[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.bool.should[ 1 ].bool.must[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        {
          bool: {
            should: [
              {
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: {
                    function_score: {
                      boost: 10,
                      query: {
                        bool: {
                          must: [
                            {
                              simple_query_string: {
                                query: queryWant,
                                default_operator: 'and',
                                fields: defaultPublicationFields
                              }
                            }
                          ],
                          filter: []
                        }
                      },
                      script_score: {
                        script: {
                          inline: 'deleted',
                          lang: 'painless'
                        }
                      }
                    }
                  },
                  inner_hits: {
                    size: 100,
                    name: 'publications',
                    explain: false
                  }
                }
              },
              {
                bool: {
                  must: [
                    {
                      has_child: {
                        query: {
                          function_score: {
                            boost: 10,
                            query: {
                              bool: {
                                should: {
                                  match_all: {}
                                },
                                filter: []
                              }
                            },
                            script_score: {
                              script: {
                                inline: 'deleted',
                                lang: 'painless'
                              }
                            }
                          }
                        },
                        score_mode: 'max',
                        inner_hits: {
                          name: 'publications',
                          size: 100,
                          explain: false
                        },
                        type: 'publication'
                      }
                    },
                    {
                      simple_query_string: {
                        query: queryWant,
                        default_operator: 'and',
                        fields: defaultWorkFields
                      }
                    }
                  ],
                  filter: []
                }
              }
            ]
          }
        }
      )
    })

    it('should build advanced query', () => {
      const urlQueryString = 'query=author%3A+Hamsun'
      const queryWant = 'author: Hamsun'
      const q = buildQuery(urlQueryString).query
      q.bool.should[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.bool.should[ 1 ].bool.must[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        advancedQuery(queryWant, 'and'))
    })

    it('should build an isbn field query from an isbn query string', () => {
      const urlQueryString = 'query=82-05-30003-8'
      const q = buildQuery(urlQueryString).query
      q.bool.should[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.bool.should[ 1 ].bool.must[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      const expected = advancedQuery('isbn:82-05-30003-8', 'and')
      expected.bool.should[ 1 ].bool.must[ 1 ] = {}

      expect(q).toEqual(
        expected
      )
    })
  })

  describe('aggregations', () => {
    const urlQueryString = 'excludeUnavailable&filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske&yearFrom=1980&yearTo=1990'
    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      const q = buildQuery(urlQueryString)
      expect(q.query.bool.should[ 0 ].has_child.query.function_score.query.bool.filter[ 0 ].terms.branches).toEqual([ 'flam', 'fmaj', 'ftor' ])
      expect(q.query.bool.should[ 0 ].has_child.query.function_score.query.bool.filter[ 1 ].range.publicationYear).toEqual({
        gte: 1980,
        lte: 1990
      })
      expect(q.query.bool.should[ 0 ].has_child.query.function_score.query.bool.must[ 0 ]).toEqual({
        'simple_query_string': {
          'default_operator': 'and',
          'fields': defaultPublicationFields,
          'query': 'fiske'
        }
      })
      expect(q.query.bool.should[ 1 ].bool.filter[ 0 ].terms.audiences[ 0 ]).toEqual('http://data.deichman.no/audience#juvenile')
      expect(q.query.bool.should[ 1 ].bool.must[ 1 ]).toEqual({
        'simple_query_string': {
          'default_operator': 'and',
          'fields': defaultWorkFields,
          'query': 'fiske'
        }
      })
    })
  })
})
