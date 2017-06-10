module.exports = {
  queryDefaults: {
    size: 100
  },
  defaultAggregates: {
    facets: {
      global: {},
      aggs: {}
    }
  },
  defaultPublicationFields: [
    'agents^10',
    'author^50',
    'country',
    'desc',
    'ean',
    'format',
    'inst',
    'isbn',
    'ismn',
    'language',
    'mainTitle^50',
    'mt',
    'partNumber',
    'partTitle',
    'publishedBy',
    'recordId',
    'series^20',
    'title^20'
  ],
  defaultWorkFields: [
    'agents^0',
    'author^50',
    'bio',
    'compType',
    'country',
    'desc',
    'genre',
    'inst',
    'language',
    'litform',
    'mainTitle',
    'mainTitle.raw',
    'mt',
    'partNumber',
    'partTitle',
    'subtitle',
    'series^10',
    'subject^50',
    'summary',
    'title^20'
  ]
}
