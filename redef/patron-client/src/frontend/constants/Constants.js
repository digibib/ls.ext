export default {
  backendUri: '/services',
  maxVisibleFilterItems: 5,
  maxSearchResults: 100,
  maxSearchResultsPerPage: 10,
  filterableFields: {
    branch: {
      name: 'publication.branches',
      prefix: ''
    },
    format: {
      name: 'publication.formats',
      prefix: 'http://data.deichman.no/format#'
    },
    language: {
      name: 'publication.languages',
      prefix: 'http://lexvo.org/id/iso639-3/'
    },
    audience: {
      name: 'publication.audiences',
      prefix: 'http://data.deichman.no/audience#'
    }
  }
}
