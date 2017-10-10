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
    { field: 'agents', boost: 1 },
    { field: 'author', boost: 1 },
    { field: 'country' },
    { field: 'desc' },
    { field: 'ean' },
    { field: 'format' },
    { field: 'inst' },
    { field: 'isbn' },
    { field: 'ismn' },
    { field: 'language' },
    { field: 'mainTitle', boost: 5, phrase: true },
    { field: 'mainTitle.raw', boost: 5 },
    { field: 'mainTitle.raw', boost: 5, tokenize: true },
    { field: 'subtitle', boost: 1, phrase: true },
    { field: 'subtitle.raw', boost: 1 },
    { field: 'mt' },
    { field: 'partTitle', phrase: true },
    { field: 'publishedBy' },
    { field: 'recordId' },
    { field: 'series', boost: 10 },
    { field: 'title', boost: 0.1 },
    { field: 'untranscribedTitle', phrase: true }
  ],
  defaultWorkFields: [
    { field: 'agents', boost: 1 },
    { field: 'author', boost: 5, minimumMatch: '60%' },
    { field: 'bio' },
    { field: 'compType' },
    { field: 'country' },
    { field: 'desc', boost: 0.1 },
    { field: 'genre' },
    { field: 'inst' },
    { field: 'language' },
    { field: 'litform' },
    { field: 'mainTitle', boost: 5, phrase: true },
    { field: 'mainTitle.raw', boost: 5 },
    { field: 'subtitle', boost: 1, phrase: true },
    { field: 'subtitle.raw', boost: 1 },
    { field: 'partTitle', phrase: true },
    { field: 'series', boost: 10 },
    { field: 'subject', boost: 0.5, phrase: true },
    { field: 'subject.raw', boost: 0.5, phrase: true },
    { field: 'summary', phrase: true },
    { field: 'untranscribedTitle', phrase: true }
  ]
}
