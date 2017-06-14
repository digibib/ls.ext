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
    { field: 'agents', boost: 10 },
    { field: 'author', boost: 30 },
    { field: 'country' },
    { field: 'desc' },
    { field: 'ean' },
    { field: 'format' },
    { field: 'inst' },
    { field: 'isbn' },
    { field: 'ismn' },
    { field: 'language' },
    { field: 'mainTitle', boost: 50 },
    { field: 'mainTitle.raw', boost: 100 },
    { field: 'mt' },
    { field: 'partTitle' },
    { field: 'publishedBy' },
    { field: 'recordId' },
    { field: 'series' },
    { field: 'title', boost: 20 }
  ],
  defaultWorkFields: [
    { field: 'agents', boost: 10 },
    { field: 'author', boost: 30 },
    { field: 'bio' },
    { field: 'compType' },
    { field: 'country' },
    { field: 'desc' },
    { field: 'genre' },
    { field: 'inst' },
    { field: 'language' },
    { field: 'litform' },
    { field: 'mainTitle', boost: 5 },
    { field: 'mainTitle.raw', boost: 5 },
    { field: 'mt' },
    { field: 'partTitle' },
    { field: 'subtitle' },
    { field: 'series' },
    { field: 'subject', boost: 1 },
    { field: 'title', boost: 20 }
  ]
}
