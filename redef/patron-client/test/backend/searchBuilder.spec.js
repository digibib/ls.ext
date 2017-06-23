/* eslint-env mocha */
import expect from 'expect'
import {buildQuery, translateFieldTerms} from '../../src/backend/utils/searchBuilder'

function advancedQuery (queryWant, boolOpeator) {
  boolOpeator = boolOpeator || 'and'
  return {
    dis_max: {
      queries: [
        {
          has_child: {
            score_mode: 'max',
            type: 'publication',
            query: {
              function_score: {
                boost: 1,
                boost_mode: 'multiply',
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
                    lang: 'painless',
                    params: {
                      ageGain: 0.6,
                      ageScale: 100,
                      now: 'deleted'
                    }
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
                  inner_hits: {
                    explain: false,
                    name: 'publications',
                    size: 100
                  },
                  query: {
                    bool: {
                      filter: [],
                      should: {
                        match_all: {}
                      }
                    }
                  },
                  score_mode: 'max',
                  type: 'publication'
                }
              },
              {
                function_score: {
                  boost: 1,
                  boost_mode: 'multiply',
                  query: {
                    query_string: {
                      default_operator: 'and',
                      query: queryWant
                    }
                  },
                  script_score: {
                    script: {
                      inline: 'deleted',
                      lang: 'painless',
                      params: {
                        itemsCountLimit: 200,
                        itemsGain: 0.3,
                        itemsScale: 100
                      }
                    }
                  }
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
      const urlQueryString = 'query=some+more+strings'
      const q = buildQuery(urlQueryString).query
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.must[ 1 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        {
          dis_max: {
            queries: [
              {
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: {
                    function_score: {
                      boost: 1,
                      boost_mode: 'multiply',
                      query: {
                        bool: {
                          must: [
                            {
                              dis_max: {
                                queries: [
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          agents: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          author: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          country: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          desc: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          ean: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          format: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          inst: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          isbn: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          ismn: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          language: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          mainTitle: {
                                            query: 'some more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          mainTitle: {
                                            query: 'some more',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          mainTitle: {
                                            query: 'more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'some more',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          subtitle: {
                                            query: 'some more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          subtitle: {
                                            query: 'some more',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          subtitle: {
                                            query: 'more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'subtitle.raw': {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          mt: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          partTitle: {
                                            query: 'some more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          partTitle: {
                                            query: 'some more',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          partTitle: {
                                            query: 'more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          publishedBy: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          recordId: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          series: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          title: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 0.1
                                    }
                                  }
                                ]
                              }
                            }
                          ],
                          filter: [
                            {
                              match: {
                                _all: {
                                  operator: 'and',
                                  query: 'some more strings'
                                }
                              }
                            }
                          ]
                        }
                      },
                      script_score: {
                        script: {
                          inline: 'deleted',
                          lang: 'painless',
                          params: {
                            now: 'deleted',
                            ageGain: 0.6,
                            ageScale: 100
                          }
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
                          bool: {
                            should: {
                              match_all: {}
                            },
                            filter: [
                              {
                                match: {
                                  _all: {
                                    operator: 'and',
                                    query: 'some more strings'
                                  }
                                }
                              }
                            ]
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
                      function_score: {
                        boost: 1,
                        boost_mode: 'multiply',
                        query: {
                          dis_max: {
                            queries: [
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      agents: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      author: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      bio: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      compType: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      country: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      desc: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 0.1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      genre: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      inst: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      language: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      litform: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      mainTitle: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      mainTitle: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      mainTitle: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      'mainTitle.raw': {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subtitle: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subtitle: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subtitle: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      'subtitle.raw': {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      partTitle: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      partTitle: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      partTitle: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      series: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 2
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              }
                            ]
                          }
                        },
                        script_score: {
                          script: {
                            inline: 'deleted',
                            lang: 'painless',
                            params: {
                              itemsCountLimit: 200,
                              itemsGain: 0.3,
                              itemsScale: 100
                            }
                          }
                        }
                      }
                    }
                  ],
                  filter: [
                    {
                      match: {
                        _all: {
                          operator: 'and',
                          query: 'some more strings'
                        }
                      }
                    }
                  ]
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
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.must[ 1 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        advancedQuery(queryWant, 'and'))
    })

    it('should build an isbn field query from an isbn query string', () => {
      const urlQueryString = 'query=82-05-30003-8'
      const q = buildQuery(urlQueryString).query
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.must[ 1 ].function_score.script_score.script.inline = 'deleted'
      const expected = advancedQuery('isbn:82-05-30003-8', 'and')
      expected.dis_max.queries[ 1 ].bool.must[ 1 ].function_score.query = {}

      expect(q).toEqual(
        expected
      )
    })
  })

  describe('aggregations', () => {
    const urlQueryString = 'excludeUnavailable&filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske&yearFrom=1980&yearTo=1990'
    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      const q = buildQuery(urlQueryString)
      expect(q.query.dis_max.queries[ 0 ].has_child.query.function_score.query.bool.filter[ 1 ].terms.branches).toEqual([ 'flam', 'fmaj', 'ftor' ])
      expect(q.query.dis_max.queries[ 0 ].has_child.query.function_score.query.bool.filter[ 2 ].range.publicationYear).toEqual({
        gte: 1980,
        lte: 1990
      })
      expect(q.query.dis_max.queries[ 1 ].bool.filter[ 1 ].terms.audiences[ 0 ]).toEqual('http://data.deichman.no/audience#juvenile')
    })
  })
})
