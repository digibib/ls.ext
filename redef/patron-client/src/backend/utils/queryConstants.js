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
    { field: 'agents', boost: 5 },
    { field: 'author', boost: 5 },
    { field: 'country' },
    { field: 'desc' },
    { field: 'ean' },
    { field: 'format' },
    { field: 'inst' },
    { field: 'isbn' },
    { field: 'ismn' },
    { field: 'language' },
    { field: 'mainTitle', boost: 50, phrase: true },
    { field: 'mainTitle.raw', boost: 100 },
    { field: 'subtitle', boost: 50, phrase: true },
    { field: 'subtitle.raw', boost: 100 },
    { field: 'mt' },
    { field: 'partTitle', phrase: true },
    { field: 'publishedBy' },
    { field: 'recordId' },
    { field: 'series', boost: 10 },
    { field: 'title', boost: 20 }
  ],
  defaultWorkFields: [
    { field: 'agents', boost: 5 },
    { field: 'author', boost: 5 },
    { field: 'bio' },
    { field: 'compType' },
    { field: 'country' },
    { field: 'desc' },
    { field: 'genre' },
    { field: 'inst' },
    { field: 'language' },
    { field: 'litform' },
    { field: 'mainTitle', boost: 5, phrase: true },
    { field: 'mainTitle.raw', boost: 5 },
    { field: 'subtitle', boost: 5, phrase: true },
    { field: 'subtitle.raw', boost: 5 },
    { field: 'mt' },
    { field: 'partTitle', phrase: true },
    { field: 'series', boost: 10 },
    { field: 'subject', boost: 1, phrase: true },
    { field: 'title', boost: 5 }
  ]
}
