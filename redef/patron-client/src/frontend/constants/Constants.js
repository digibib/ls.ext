export default {
  backendUri: '/services',
  maxVisibleFilterItems: 5,
  searchQuerySize: 10,
  filterableFields: {
    branch: {
      name: 'work.publications.branches',
      prefix: ''
    },
    format: {
      name: 'work.publications.formats',
      prefix: 'http://data.deichman.no/format#'
    },
    language: {
      name: 'work.publications.languages',
      prefix: 'http://lexvo.org/id/iso639-3/'
    },
    audience: {
      name: 'work.publications.audiences',
      prefix: 'http://data.deichman.no/audience#'
    }
  }
}
