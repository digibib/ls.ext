module.exports = {
  backendUri: '/services',
  maxVisibleFilterItems: 5,
  maxSearchResults: 100,
  maxSearchResultsPerPage: 10,
  filterableFields: {
    language: {
      name: 'languages',
      prefix: 'http://lexvo.org/id/iso639-3/'
    },
    branch: {
      name: 'branches',
      prefix: ''
    },
    mediatype: {
      name: 'mediatype',
      prefix: 'http://data.deichman.no/mediaType#'
    },
    format: {
      name: 'formats',
      prefix: 'http://data.deichman.no/format#'
    },
    audience: {
      name: 'audiences',
      prefix: 'http://data.deichman.no/audience#'
    },
    fictionNonfiction: {
      name: 'fictionNonfiction',
      prefix: 'http://data.deichman.no/fictionNonfiction#'
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
    'http://data.deichman.no/mediaType#Periodical': 'book',
    '': 'undefined'
  },
  mediaTypeIconsMap: {
    'book': 'icon-book',
    'audiobook': 'icon-audiobook',
    'music': 'icon-music',
    'music-note': 'icon-music',
    'movie': 'icon-movie',
    'play': 'icon-cd',
    'undefined': 'icon-help'
  },
  preferredLanguages: [
    'http://lexvo.org/id/iso639-3/nob',
    'http://lexvo.org/id/iso639-3/nno',
    'http://lexvo.org/id/iso639-3/nor',
    'http://lexvo.org/id/iso639-3/eng',
    'http://lexvo.org/id/iso639-3/swe',
    'http://lexvo.org/id/iso639-3/dan',
    'http://lexvo.org/id/iso639-3/ger',
    'http://lexvo.org/id/iso639-3/fre',
    'http://lexvo.org/id/iso639-3/spa',
    'http://lexvo.org/id/iso639-3/ita'
  ],
  enabledParameter: null /* used to clarify url parameters without value, e.g. ?hideFilters */
}
