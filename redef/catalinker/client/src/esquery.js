(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.esquery = factory();
  }
}(this, function () {
  "use strict"

  const fields = {
    publication: ["title", "recordId"],
    work: ["uri", "mainEntryName", "mainTitle", "partTitle", "partNumber", "subtitle"]
  }

  function isAdvancedQuery (queryString) {
    if (queryString === '' || queryString == null) {
      return false
    }
    return /[:\+\^()´"*]| -[:w]*| AND | OR | NOT /.test(queryString.replace(/&nbsp;/g, ' '))
  }

  const rgxpWorkId = new RegExp(/^w[a-f0-9]+$/)

  function transformWorkId(queryString) {
    if (rgxpWorkId.test(queryString)) {
      return `"http\:\/\/data.deichman.no\/work\/${queryString}"`
    }
    return queryString
  }

  return {
    isAdvancedQuery: isAdvancedQuery,

    basic: function (indexType, searchString) {
      if (indexType === 'work') {
        searchString = transformWorkId(searchString)
      }
      var query = {
        size: 100,
        sort: [
          {
            "displayLine1": {
              "order": "asc",
              "unmapped_type": "keyword"
            }
          },
        ]
      }
      if (isAdvancedQuery(searchString)) {
        query.query = {
          query_string: {
            query: searchString,
            default_operator: 'and'
          }
        }
      } else {
        query.query = {
          simple_query_string: {
            query: searchString.replace(/\!/g, '\\!').replace(/[^]*&[^]*/g, '"$&"'),
            default_operator: 'and',
            fields: fields[indexType]
          }
        }
      }
      return query
    },

    worksByMainEntry: function(searchString, mainEntry) {
      return  {
        size: 100,
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query: searchString.replace(/\!/g, '\\!').replace(/ & /g, ' "&" '),
                  default_operator: 'and'
                }
              },
              {
                nested: {
                  path: 'contributors',
                  query: {
                    bool: {
                      must: [
                        {
                          term: {
                            'contributors.mainEntry': true
                          }
                        },
                        {
                          nested: {
                            path: 'contributors.agent',
                            query: {
                              term: {
                                'contributors.agent.uri': mainEntry
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }
  }

}));
