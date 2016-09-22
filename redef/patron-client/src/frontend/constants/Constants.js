module.exports = {
  baseURL: true ? 'http://localhost:8000'
    : '*TODO: Replace this with remote URL, and replace true with condition to check if app is running locally or remote (isomorphic-fetch requires absolute URLs)*',
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
  },
  mediaTypeIcons: {
    'http://data.deichman.no/mediaType#Book': 'book',
    'http://data.deichman.no/mediaType#Audiobook': 'audiobook',
    'http://data.deichman.no/mediaType#LanguageCourse': 'book',
    'http://data.deichman.no/mediaType#MusicRecording': 'music',
    'http://data.deichman.no/mediaType#SheetMusic': 'music-note',
    'http://data.deichman.no/mediaType#Film': 'movie',
    'http://data.deichman.no/mediaType#Game': 'play',
    'http://data.deichman.no/mediaType#ComicBook': 'book',
    'http://data.deichman.no/mediaType#Map': 'book',
    'http://data.deichman.no/mediaType#Periodical': 'book'
  }
}
