module.exports = {
  backendUri: '/services',
  maxVisibleFilterItems: 5,
  maxSearchResults: 100,
  maxSearchResultsPerPage: 10,
  filterableFields: {
    branch: {
      name: 'branches',
      prefix: ''
    },
    format: {
      name: 'formats',
      prefix: 'http://data.deichman.no/format#'
    },
    language: {
      name: 'languages',
      prefix: 'http://lexvo.org/id/iso639-3/'
    },
    audience: {
      name: 'audiences',
      prefix: 'http://data.deichman.no/audience#'
    }
  }
}
