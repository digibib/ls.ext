const Constants = require('../../frontend/constants/Constants')

module.exports = {
  queryDefaults: {
    size: 0
  },
  defaultAggregates: {
    facets: {
      global: {},
      aggs: {}
    },
    byWork: {
      terms: {
        field: 'workUri',
        order: { top: 'desc' },
        size: Constants.maxSearchResults
      },
      aggs: {
        publications: {
          top_hits: {
            size: 1
          }
        },
        top: {
          max: {
            script: {
              lang: 'expression',
              inline: '_score'
            }
          }
        }
      }
    },
    workCount: {
      cardinality: {
        field: 'workUri'
      }
    }
  },
  defaultFields: [
    'agents',
    'author^50',
    'bio',
    'compType',
    'country',
    'desc',
    'ean',
    'format',
    'genre',
    'inst',
    'isbn',
    'ismn',
    'language',
    'litform',
    'mainTitle^30',
    'mt',
    'partNumber',
    'partTitle',
    'publishedBy',
    'recordId',
    'series^10',
    'subject^10',
    'summary',
    'title^20',
    'workMainTitle',
    'workPartNumber',
    'workPartTitle',
    'workSubtitle'
  ]
}
