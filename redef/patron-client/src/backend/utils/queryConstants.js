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
              lang: 'painless',
              // values to tweak:
              //   0.5 = gain (weight factor)
              //   100 = scale (in days since catalogued)
              inline: "if (doc.created.value != null) { return _score * (1 + (0.5*100)/(100+(System.currentTimeMillis()-doc.created.date.getMillis())/86400000)); } return _score;"
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
