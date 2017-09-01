const title = true
module.exports = {
  queryFieldTranslations: {
    'ag': { scope: 'Publication', translation: 'ageLimit' },
    'ageLimit': '=ag',
    'aktør': 'agents',
    'aldersgrense': '=ag',
    'alf': { scope: 'Publication', translation: 'writingSystem' },
    'writingSystem': '=alf',
    'alfabet': '=alf',
    'arr': 'musicalArranger',
    'arrangør': 'musicalArranger',
    'be': { scope: 'Work', translation: 'inst' },
    'inst': '=be',
    'bearb': 'adaptor',
    'bearbeider': 'adaptor',
    'besetning': '=be',
    'bid': 'contributor',
    'bidragsyter': 'contributor',
    'bio': '=biografi',
    'biografi': { scope: 'Work', translation: 'bio' },
    'biography': { scope: 'Work', translation: 'bio' },
    'delnummer': { scope: 'Publication', translation: 'partNumber', title },
    'deltittel': { scope: 'Publication', translation: 'partTitle' },
    'dir': 'conductor',
    'dirigent': 'conductor',
    'partNumber': '=dn',
    'dn': { scope: 'Publication', translation: 'partNumber', title },
    'partTitle': '=dt',
    'dt': { scope: 'Publication', translation: 'partTitle', title },
    'subject': '=em',
    'em': { scope: 'Work', translation: 'subject' },
    'emne': '=em',
    'f': { scope: 'Publication', translation: 'format' },
    'format': '=f',
    'author': { scope: 'Work', translation: 'author' },
    'fo': '=author',
    'forfatter': '=author',
    'forl': { scope: 'Publication', translation: 'publishedBy' },
    'isbn': { scope: 'Publication', translation: 'isbn' },
    'forlag': '=forl',
    'publishedBy': '=forl',
    'utg': '=forl',
    'utgiver': '=forl',
    'form': { scope: 'Work', translation: 'litform' },
    'litform': '=form',
    'lf': '=form',
    'foto': 'photographer',
    'fotograf': 'photographer',
    'ge': { scope: 'Work', translation: 'genre' },
    'genre': '=ge',
    'hovedtittel': { translation: 'mainTitle', title },
    'ht': { scope: 'Publication', translation: 'mainTitle', title },
    'mainTitle': '=ht',
    'ill': 'illustrator',
    'illustratør': 'illustrator',
    'innl': 'reader',
    'innleser': 'reader',
    'klasse': { scope: 'Work', translation: 'dewey' },
    'kl': '=klasse',
    'dewey': '=klasse',
    'komp': 'composer',
    'komponist': 'composer',
    'komposisjonstype': { scope: 'Work', translation: 'compType' },
    'compType': '=komposisjonstype',
    'kor': 'coreographer',
    'koreograf': 'coreographer',
    'kt': '=komposisjonstype',
    'land': { scope: 'Work', translation: 'country' },
    'country': '=land',
    'manus': 'scriptWriter',
    'manusforfatter': 'scriptWriter',
    'medietype': { scope: 'Publication', translation: 'mt' },
    'mt': '=medietype',
    'nasjonalitet': { scope: 'Work', translation: 'nationality' },
    'nasj': '=nasjonalitet',
    'nationality': '=nasjonalitet',
    // 'odn': {translation: 'parts.partNumber', title},
    // 'odt': {translation: 'parts.partTitle', title},
    'oht': { scope: 'Publication', translation: 'parts.mainTitle', title },
    'parts.mainTitle': '=oht',
    'originalDelnummer': 'partNumber',
    'originalDeltittel': 'partTitle',
    'originalHovedtittel': { scope: 'Work', translation: 'mainTitle' },
    'originalSpråk': { scope: 'Publication', translation: 'origLang' },
    'origLang': '=originalSpråk',
    'ospr': '=originalSpråk',
    'originalUndertittel': { scope: 'Work', translation: 'subtitle' },
    'originalÅr': { scope: 'Work', translation: 'publicationYear' },
    'publicationYear': '=originalÅr',
    'out': '=originalUndertittel',
    'ov': 'translator',
    'oversetter': 'translator',
    'oår': { scope: 'Work', translation: 'publicationYear' },
    'person': 'agents',
    'prod': 'producer',
    'produsent': 'producer',
    'red': 'editor',
    'redaktør': 'editor',
    'reg': 'director',
    'regissør': 'director',
    'se': '=serie',
    'serie': { scope: 'Work', translation: 'series' },
    'series': '=serie',
    'sjanger': '=ge',
    'sku': 'actor',
    'skuespiller': 'actor',
    'språk': { scope: 'Publication', translation: 'language' },
    'spr': '=språk',
    'language': '=språk',
    'tekst': { scope: 'Publication', translation: 'subtitles' },
    'tekstforfatter': 'lyricist',
    'tfo': 'lyricist',
    'ti': { scope: 'Publication', translation: 'title', title },
    'title': '=ti',
    'tilp': 'adaptation',
    'tilpasning': 'adaptation',
    'tittel': '=ti',
    'tittelnummer': { scope: 'Publication', translation: 'recordId' },
    'recordId': '=tittelnummer',
    'tnr': '=tittelnummer',
    'undertekster': { scope: 'Publication', translation: 'subtitles' },
    'subtitles': '=undertekster',
    'undertittel': { translation: 'subtitle', title },
    'ut': '=undertittel',
    'subtitle': '=undertittel',
    'utgivelsesår': { scope: 'Publication', translation: 'publicationYear' },
    'utøv': 'performer',
    'utøver': 'performer',
    'år': '=utgivelsesår'
  },
  backendUri: '/services',
  maxVisibleFilterItems: 3,
  maxSearchResultsPerPage: 20,
  filterableFields: {
    branch: {
      name: 'branches',
      prefix: '',
      domain: 'publication'
    },
    mediatype: {
      name: 'mediatype',
      prefix: 'http://data.deichman.no/mediaType#',
      domain: 'publication'
    },
    format: {
      name: 'formats',
      prefix: 'http://data.deichman.no/format#',
      domain: 'publication'
    },
    language: {
      name: 'languages',
      prefix: 'http://lexvo.org/id/iso639-3/',
      domain: 'publication'
    },
    audience: {
      name: 'audiences',
      prefix: 'http://data.deichman.no/audience#',
      domain: 'work'
    },
    fictionNonfiction: {
      name: 'fictionNonfiction',
      prefix: 'http://data.deichman.no/fictionNonfiction#',
      domain: 'work'
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
    'http://lexvo.org/id/iso639-3/sma',
    'http://lexvo.org/id/iso639-3/smn',
    'http://lexvo.org/id/iso639-3/sjk',
    'http://lexvo.org/id/iso639-3/sjd',
    'http://lexvo.org/id/iso639-3/sje',
    'http://lexvo.org/id/iso639-3/smi',
    'http://lexvo.org/id/iso639-3/sms',
    'http://lexvo.org/id/iso639-3/sjt',
    'http://lexvo.org/id/iso639-3/sju',
    'http://lexvo.org/id/iso639-3/smj',
    'http://lexvo.org/id/iso639-3/sme',
    'http://lexvo.org/id/iso639-3/sia',
    'http://lexvo.org/id/iso639-3/swe',
    'http://lexvo.org/id/iso639-3/dan',
    'http://lexvo.org/id/iso639-3/ger',
    'http://lexvo.org/id/iso639-3/fre',
    'http://lexvo.org/id/iso639-3/spa',
    'http://lexvo.org/id/iso639-3/ita',
    'http://lexvo.org/id/iso639-3/rus'
  ],
  enabledParameter: null /* used to clarify url parameters without value, e.g. ?hideFilters */
}
