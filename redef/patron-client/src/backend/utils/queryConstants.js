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
              inline: `
                def langscores = [
                  "nob": 1.5,
                  "nno": 1.5,
                  "nor": 1.5,
                  "eng": 1.4,
                  "swe": 1.3,
                  "dan": 1.3,
                  "ger": 1.2,
                  "fre": 1.2,
                  "spa": 1.1,
                  "ita": 1.1
                ];
                def langscore = langscores.get(doc.language.value);
                if (langscore == null) {
                  langscore = 1
                }
                def score = _score * langscore;
                def age_gain=0.5;
                def age_scale=100;
                if (doc.created.value != null) {
                  score *= (1 + (age_gain*age_scale)/(age_scale+(System.currentTimeMillis()-doc.created.date.getMillis())/86400000));
                }
                return score;`.replace('\n', ''),
              lang: 'painless'
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
