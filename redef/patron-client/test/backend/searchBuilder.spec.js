/* eslint-env mocha */
import expect from 'expect'
import {buildQuery, translateFieldTerms} from '../../src/backend/utils/searchBuilder'
import {queryFieldTranslations} from '../../src/frontend/constants/Constants'

function advancedQuery (queryWantForWorkLevel, queryWantedForPubLevel, boolOperator, options) {
  options = options || {}
  boolOperator = boolOperator || 'and'
  return {
    query: {
      bool: {
        must: {
          dis_max: {
            queries: [
              {
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: {
                    bool: {
                      filter: options.withDefaultFilter ? [ {
                        query_string: {
                          default_operator: 'and',
                          query: options.scopedQuery || '*',
                          lenient: true
                        }
                      } ] : [],
                      must: [
                        {
                          function_score: {
                            boost: 1,
                            boost_mode: 'replace',
                            query: {
                              bool: {
                                must: [
                                  {
                                    query_string: {
                                      query: queryWantedForPubLevel,
                                      default_operator: boolOperator,
                                      lenient: true
                                    }
                                  }
                                ]
                              }
                            },
                            score_mode: 'max',
                            script_score: {
                              script: {
                                inline: 'deleted',
                                lang: 'painless'
                              }
                            }
                          }
                        }
                      ]
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
                  must: {
                    has_child: {
                      type: 'publication',
                      score_mode: 'max',
                      query: {
                        bool: {
                          filter: options.withDefaultFilter ? [ {
                            query_string: {
                              default_operator: 'and',
                              query: options.scopedQuery || '*',
                              lenient: true
                            }
                          } ] : [],
                          must: [
                            {
                              match_all: {}
                            }
                          ]
                        }
                      },
                      inner_hits: {
                        size: 100,
                        name: 'publications'
                      }
                    }
                  },
                  must_not: options.exclusionQuery
                    ? {
                      has_child: {
                        type: 'publication',
                        query: {
                          query_string: {
                            query: options.exclusionQuery,
                            default_operator: 'and',
                            lenient: true
                          }
                        }
                      }
                    }
                    : [],
                  should: [
                    {
                      function_score: {
                        boost: 1,
                        boost_mode: 'replace',
                        query: {
                          query_string: {
                            query: queryWantForWorkLevel,
                            default_operator: boolOperator,
                            lenient: true
                          }
                        },
                        script_score: {
                          script: {
                            inline: 'deleted',
                            lang: 'painless',
                            params: {
                              now: 'deleted',
                              itemsGain: 0.0,
                              itemsScale: 100,
                              itemsCountLimit: 200,
                              ageGain: 6.0,
                              ageScale: 30000
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        filter: [
          {
            bool: {
              minimum_should_match: 1,
              should: [
                {
                  query_string: {
                    query: queryWantForWorkLevel,
                    default_operator: boolOperator
                  }
                },
                {
                  has_child: {
                    type: 'publication',
                    query: {
                      query_string: {
                        query: queryWantForWorkLevel,
                        default_operator: boolOperator
                      }
                    }
                  }
                }
              ],
              must: []
            }
          }
        ]
      }
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
        [ 'abc æøå "123"', '(abc AND (æøå AND 123))' ],
        [ 'year:1999', 'year:1999' ],
        [ 'forf:Hamsun', 'author:Hamsun' ],
        [ 'forf:"Knut Hamsun"', 'author:"Knut Hamsun"' ],
        [ 'forf:"Knut Hamsun" sult', '(author:"Knut Hamsun" AND sult)' ],
        [ 'forf:"Knut Hamsun" OR sult', '(author:"Knut Hamsun" OR sult)' ],
        [ 'forf:Hamsun sult', '(author:Hamsun AND sult)' ],
        [ 'tittel:"slaktehus 55" tag:sf', '(title:"slaktehus 55" AND subject:sf)' ],
        [ 'title:"forf: Hamsun"', 'title:"forf: Hamsun"' ],
        [ 'genre:(hørespill kriminal)', 'genre:(hørespill AND kriminal)' ]
      ]
      tests.forEach((test, index) => {
        expect(translateFieldTerms(test[ 0 ], translations)).toEqual(test[ 1 ], `Failed test no ${index}`)
      })
    })

    it('respects scope', () => {
      const translations = {
        'author': { scope: 'Work', translation: 'author' },
        'forf': '=author',
        'aldersgrense': { scope: 'Publication', translation: 'ageLimit' },
        'ag': '=aldersgrense',
        'tittel': 'title',
        'tag': 'subject',
        'serie': { scope: 'Publication', translation: 'series' }
      }
      const tests = [
        [ 'Work', 'Publication.forf:Hamsun', '' ],
        [ 'Publication', 'forf:Hamsun', '' ],
        [ 'Publication', 'Publication.forf:Hamsun', 'author:Hamsun' ],
        [ 'Work', 'forf:Hamsun AND aldersgrense:12 AND title:Sult', '(author:Hamsun AND title:Sult)' ],
        [ 'Work', 'forf:Hamsun OR aldersgrense:12 AND title:Sult', '(author:Hamsun OR title:Sult)' ],
        [ 'Publication', 'forf:Hamsun AND aldersgrense:12 AND title:Sult', '(ageLimit:12 AND title:Sult)' ],
        [ 'Publication', 'forf:Hamsun AND (aldersgrense:12 OR title:Sult)', '(ageLimit:12 OR title:Sult)' ],
        [ 'Publication', 'forf:Hamsun AND ag:12 AND title:Sult', '(ageLimit:12 AND title:Sult)' ],
        [ 'Publication', 'forf:Hamsun AND aldersgrense:[12 TO 14] AND title:Sult', '(ageLimit:[12 TO 14] AND title:Sult)' ],
        [ 'Publication', 'forf:Hamsun AND aldersgrense:{15 TO 16} AND title:Sult', '(ageLimit:{15 TO 16} AND title:Sult)' ],
        [ 'Publication', 'Publication.author:Hamsun AND aldersgrense:{17 TO 18} AND title:Sult', '(author:Hamsun AND (ageLimit:{17 TO 18} AND title:Sult))' ],
        [ 'Publication', 'Publication.forf:Hamsun AND aldersgrense:{19 TO 20} AND title:Sult', '(author:Hamsun AND (ageLimit:{19 TO 20} AND title:Sult))' ],
        [ 'Work', 'Publication.forf:Hamsun AND aldersgrense:{21 TO 22} AND title:Sult', 'title:Sult' ],
        [ undefined, 'forf:Hamsun AND aldersgrense:{23 TO 24} AND title:Sult', '(author:Hamsun AND (ageLimit:{23 TO 24} AND title:Sult))' ],
        [ 'Work', 'Publication.forf:Hamsun AND aldersgrense:{21 TO 22} AND title:-Sult', 'title:-Sult' ],
        [ 'Work', 'Publication.forf:Hamsun AND aldersgrense:{21 TO 22} AND title:-"Su?t"', 'title:-Su?t' ],
        [ 'Work', 'title:"Sult"~5', 'title:Sult~5' ],
        [ 'Work', 'title:Sult^5', 'title:Sult^5' ],
        [ 'Work', 'title:(Sult OR "Tørst")', 'title:(Sult OR Tørst)' ],
        [ 'Work', 'title:Sult author:Hamsun', '(title:Sult AND author:Hamsun)' ],
        [ 'Work', 'title:Sult AND (author:Hamsun OR author:Ibsen)', '(title:Sult AND (author:Hamsun OR author:Ibsen))' ],
        [ 'Work', 'title:Sult AND ((author:Hamsun OR (author:Ibsen AND publicationYear:1890)))', '(title:Sult AND (author:Hamsun OR (author:Ibsen AND publicationYear:1890)))' ],
        [ 'Work', 'author:ibsen NOT aldersgrense:[12 TO 15]', 'author:ibsen' ],
        [ 'Work', 'author:ibsen NOT title:Dukkehjem', 'author:ibsen NOT title:Dukkehjem' ],
        [ 'Work', 'serie:"Harry Potter" NOT mysteriekammeret', '*:* NOT mysteriekammeret' ],
        [ 'Publication', 'author:ibsen NOT aldersgrense:[12 TO 15]', '*:* NOT ageLimit:[12 TO 15]' ],
        [ 'Publication', 'Work.ht:Brand AND format:Bok', 'format:Bok' ],
        [ 'Publication', 'title:Sult AND aldersgrense:12', 'ageLimit:12', true ], // when skipUnscoped is true, fields that are not associated with a scope or explicitly scoped in the expression are skipped
        [ 'Publication', 'Harry Potter og ildbegeret aldersgrense:12', 'ageLimit:12', true ],
        [ 'Publication', 'Harry Potter NOT mysteriekammeret', 'mysteriekammeret', false, true ],
        [ 'Publication', 'serie:"Karsten og Petra" NOT (svømme OR danse)', '(svømme OR danse)', false, true ],
        [ 'Publication', 'serie:"Karsten og Petra" NOT (svømme OR danse OR skiskole)', '(svømme OR (danse OR skiskole))', false, true ]
      ]
      tests.forEach((test, index) => {
        const scoped = translateFieldTerms(test[ 1 ], translations, test[ 0 ], test[ 3 ], test[ 4 ])
//        console.log(`[ '${test[ 0 ]}', '${test[ 1 ]}', '${scoped}' ],`)
        expect(scoped).toEqual(test[ 2 ], `Test ${index + 1} failed`)
      })
    })

    it('should build simple query', () => {
      const urlQueryString = 'query=some+more+strings'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.bool.must[ 0 ].function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        {
          dis_max: {
            queries: [
              {
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: {
                    bool: {
                      filter: [],
                      must: [
                        {
                          function_score: {
                            boost: 1,
                            boost_mode: 'replace',
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                                  slop: 0
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
                                            boost: 10
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
                                        },
                                        {
                                          constant_score: {
                                            boost: 1,
                                            filter: {
                                              match_phrase: {
                                                untranscribedTitle: {
                                                  query: 'some more strings',
                                                  slop: 0
                                                }
                                              }
                                            }
                                          }
                                        },
                                        {
                                          constant_score: {
                                            boost: 1,
                                            filter: {
                                              match_phrase: {
                                                untranscribedTitle: {
                                                  query: 'some more',
                                                  slop: 0
                                                }
                                              }
                                            }
                                          }
                                        },
                                        {
                                          constant_score: {
                                            boost: 1,
                                            filter: {
                                              match_phrase: {
                                                untranscribedTitle: {
                                                  query: 'more strings',
                                                  slop: 0
                                                }
                                              }
                                            }
                                          }
                                        }
                                      ]
                                    }
                                  }
                                ]
                              }
                            },
                            score_mode: 'max',
                            script_score: {
                              script: {
                                inline: 'deleted',
                                lang: 'painless'
                              }
                            }
                          }
                        }
                      ]
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
                  must: {
                    has_child: {
                      score_mode: 'max',
                      type: 'publication',
                      query: {
                        bool: {
                          filter: [],
                          must: [
                            {
                              match_all: {}
                            }
                          ]
                        }
                      },
                      inner_hits: {
                        size: 100,
                        name: 'publications'
                      }
                    }
                  },
                  must_not: [],
                  should: [
                    {
                      function_score: {
                        boost: 1,
                        boost_mode: 'replace',
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                  boost: 10
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'some more strings',
                                        slop: 0
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
                                        slop: 0
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
                                        slop: 0
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
                                      'subject.raw': {
                                        query: 'some more strings',
                                        slop: 0
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
                                      'subject.raw': {
                                        query: 'some more',
                                        slop: 0
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
                                      'subject.raw': {
                                        query: 'more strings',
                                        slop: 0
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              },
                              {
                                constant_score: {
                                  boost: 1,
                                  filter: {
                                    match_phrase: {
                                      summary: {
                                        query: 'some more strings',
                                        slop: 0
                                      }
                                    }
                                  }
                                }
                              },
                              {
                                constant_score: {
                                  boost: 1,
                                  filter: {
                                    match_phrase: {
                                      summary: {
                                        query: 'some more',
                                        slop: 0
                                      }
                                    }
                                  }
                                }
                              },
                              {
                                constant_score: {
                                  boost: 1,
                                  filter: {
                                    match_phrase: {
                                      summary: {
                                        query: 'more strings',
                                        slop: 0
                                      }
                                    }
                                  }
                                }
                              },
                              {
                                constant_score: {
                                  boost: 1,
                                  filter: {
                                    match_phrase: {
                                      untranscribedTitle: {
                                        query: 'some more strings',
                                        slop: 0
                                      }
                                    }
                                  }
                                }
                              },
                              {
                                constant_score: {
                                  boost: 1,
                                  filter: {
                                    match_phrase: {
                                      untranscribedTitle: {
                                        query: 'some more',
                                        slop: 0
                                      }
                                    }
                                  }
                                }
                              },
                              {
                                constant_score: {
                                  boost: 1,
                                  filter: {
                                    match_phrase: {
                                      untranscribedTitle: {
                                        query: 'more strings',
                                        slop: 0
                                      }
                                    }
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
                              itemsGain: 0.0,
                              itemsScale: 100,
                              itemsCountLimit: 200,
                              ageGain: 6.0,
                              ageScale: 30000.0
                            }
                          }
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
      const urlQueryString = 'query=author%3AHamsun'
      const queryWant = 'author:Hamsun'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.bool.must[ 0 ].function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        advancedQuery(queryWant, '*', 'and', { withDefaultFilter: true }).query.bool.must)
    })

    it('should build advanced query with negation', () => {
      const urlQueryString = 'query=ht%3A%22Harry+Potter%22+NOT+mysteriekammeret'
      const queryWantWorkLevel = '*:* NOT mysteriekammeret'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.bool.must[ 0 ].function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        advancedQuery(queryWantWorkLevel, 'mainTitle:"Harry Potter" NOT mysteriekammeret', 'and', {
          withDefaultFilter: true,
          scopedQuery: 'mainTitle:"Harry Potter"',
          exclusionQuery: 'mysteriekammeret'
        }).query.bool.must)
    })

    it('should build an isbn field query from an isbn query string', () => {
      const urlQueryString = 'query=82-05-30003-8'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.bool.must[ 0 ].function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.script_score.script.inline = 'deleted'
      const expected = advancedQuery('isbn:"82-05-30003-8"', 'isbn:"82-05-30003-8"', 'and').query.bool.must
      expected.dis_max.queries[ 1 ].bool.should[ 0 ].function_score.query = {}

      expect(q).toEqual(
        expected
      )
    })

    it('should map all scoped translations to themselves', () => {
      Object.keys(queryFieldTranslations).forEach((key) => {
        const translationSpec = queryFieldTranslations[ key ]
        if (translationSpec.scope) {
          expect(queryFieldTranslations[ translationSpec.translation ]).toExist(`Translation of "${key}" with scope ${translationSpec.scope} should have its own translation aliasing entry to ensure it is scoped properly`)
        }
        if (typeof translationSpec === 'string' && translationSpec.startsWith('=')) {
          const aliasedTranslationSpec = queryFieldTranslations[ translationSpec.substring(1) ]
          expect(aliasedTranslationSpec).toExist(`TranslationSpec for alias ${key}:${translationSpec} does not exist`)
          expect(typeof aliasedTranslationSpec).toEqual('object', `Value of aliased translation ${key}=>${translationSpec}=>${translationSpec.substring(1)} should be an object`)
        }
      })
    })
  })

  describe('aggregations', () => {
    const urlQueryString = 'excludeUnavailable&filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske&yearFrom=1980&yearTo=1990'
    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      const a = buildQuery(urlQueryString).aggs.facets.aggs.facets.aggs.audiences
      expect(a.filter.bool.must).toInclude(
        {
          has_child: {
            type: 'publication',
            query: {
              terms: {
                availableBranches: [
                  'flam',
                  'fmaj',
                  'ftor'
                ]
              }
            }
          }
        }
      )
      expect(a.filter.bool.must).toInclude(
        {
          has_child: {
            type: 'publication',
            query: {
              range: {
                publicationYear: {
                  gte: 1980,
                  lte: 1990
                }
              }
            }
          }
        }
      )
      expect(a.filter.bool.must).toNotInclude(
        {
          terms: {
            audiences: [
              'http://data.deichman.no/audience#juvenile'
            ]
          }
        }
      )

      const b = buildQuery(urlQueryString).aggs.facets.aggs.facets.aggs.fictionNonfiction
      expect(b.filter.bool.must).toInclude(
        {
          terms: {
            audiences: [
              'http://data.deichman.no/audience#juvenile'
            ]
          }
        }
      )
    })
  })
})
