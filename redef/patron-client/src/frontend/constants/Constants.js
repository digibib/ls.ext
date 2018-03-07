const title = true
module.exports = {
  knownFields: {
    'ag': true,
    'ageLimit': true,
    'agents': true,
    'aktør': true,
    'aldersgrense': true,
    'alf': true,
    'alfabet': true,
    'arr': true,
    'arrangør': true,
    'author': true,
    'be': true,
    'bearb': true,
    'bearbeider': true,
    'besetning': true,
    'bid': true,
    'bidragsyter': true,
    'bio': true,
    'biografi': true,
    'biography': true,
    'compType': true,
    'country': true,
    'delnummer': true,
    'deltittel': true,
    'desc': true,
    'dewey': true,
    'dir': true,
    'dirigent': true,
    'dn': true,
    'dt': true,
    'ean': true,
    'em': true,
    'emne': true,
    'f': true,
    'fo': true,
    'forfatter': true,
    'forl': true,
    'forlag': true,
    'form': true,
    'format': true,
    'foto': true,
    'fotograf': true,
    'ge': true,
    'genre': true,
    'ht': true,
    'ill': true,
    'illustratør': true,
    'innl': true,
    'innleser': true,
    'inst': true,
    'isbn': true,
    'ismn': true,
    'kd': true,
    'kl': true,
    'klasse': true,
    'komp': true,
    'komponist': true,
    'komposisjonstype': true,
    'kor': true,
    'koreograf': true,
    'kt': true,
    'kw': true,
    'land': true,
    'language': true,
    'lf': true,
    'litform': true,
    'mainTitle': true,
    'manus': true,
    'manusforfatter': true,
    'medietype': true,
    'mt': true,
    'nasj': true,
    'nasjonalitet': true,
    'nationality': true,
    'oht': true,
    'originalDelnummer': true,
    'originalDeltittel': true,
    'originalHovedtittel': true,
    'originalSpråk': true,
    'originalUndertittel': true,
    'originalÅr': true,
    'origLang': true,
    'ospr': true,
    'out': true,
    'ov': true,
    'oversetter': true,
    'oår': true,
    'partNumber': true,
    'parts.': true,
    'partTitle': true,
    'person': true,
    'prod': true,
    'produsent': true,
    'publicationYear': true,
    'publishedBy': true,
    'recordId': true,
    'red': true,
    'redaktør': true,
    'reg': true,
    'regissør': true,
    'se': true,
    'serie': true,
    'series': true,
    'sjanger': true,
    'sku': true,
    'skuespiller': true,
    'spr': true,
    'språk': true,
    'stikkord': true,
    'subject': true,
    'subtitle': true,
    'subtitles': true,
    'summary': true,
    'tag': true,
    'tekst': true,
    'tekstforfatter': true,
    'tfo': true,
    'ti': true,
    'tilp': true,
    'tilpasning': true,
    'title': true,
    'tittel': true,
    'tittelnummer': true,
    'tnr': true,
    'undertekster': true,
    'undertittel': true,
    'untranscribedTitle': true,
    'ut': true,
    'utg': true,
    'utgivelsesår': true,
    'utgiver': true,
    'utøv': true,
    'utøver': true,
    'writingSystem': true,
    'år': true
  },
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
    'komposisjonstype': { scope: 'Work', translation: 'compositionType' },
    'compositionType': { scope: 'Work', translation: 'komposisjonstype' },
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
    'tag': { scope: 'Work', translation: 'tag' },
    'stikkord': '=tag',
    'kw': '=tag',
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
    'book': '/images/book24.svg',
    'audiobook': '/images/headset24.svg',
    'music': '/images/music24.svg',
    'music-note': '/images/music24.svg',
    'movie': '/images/film.svg',
    'play': '/images/spill.svg',
    'undefined': '/images/annet.svg'
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
  enabledParameter: null, /* used to clarify url parameters without value, e.g. ?hideFilters */
  predefinedQueries: [
    {
      query: '/search?query=%2A',
      title: 'Her kan du bla i hele samlingen til Deichman',
      desc: 'Bruk filtrene og taggene for å finne det som passer for deg.',
      image: '/images/q1.jpg'
    },
    {
      query: '/search?filter=audience_adult&filter=fictionNonfiction_nonfiction&filter=language_eng&filter=language_nno&filter=language_nob&filter=mediatype_Book&query=%2A&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=language&yearFrom=2017',
      title: 'Lær noe nytt',
      desc: 'Se våre nyeste fagbøker. Bruk taggene for å finne tema som interesserer deg.',
      image: '/images/q4.jpg'
    },
    {
      query: '/search?filter=audience_adult&filter=mediatype_Film&query=%2A&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=language&yearFrom=2017',
      title: 'Se film på gamlemåten',
      desc: 'Her er de nyeste godbitene. Bruk filteret målgruppe for å finne det som passer deg.',
      image: '/images/q5.jpg'
    },
    {
      query: '/search?filter=audience_ages3To5&filter=audience_ages6To8&filter=language_nob&filter=mediatype_Book&query=sjanger%3Alettlest&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=audience&showMore=mediatype&yearFrom=2012',
      title: 'Lesestart',
      desc: 'For deg som lærer å lese.',
      image: '/images/q10.jpg'
    },
    {
      query: '/search?filter=audience_ages13To15&filter=language_eng&filter=language_nno&filter=language_nob&filter=mediatype_Book&query=form%3Aroman&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=audience&showMore=language&showMore=mediatype&yearFrom=2017',
      title: 'Våre nyeste  ungdomsromaner',
      desc: 'Her finner vårt utvalg av romaner for ungdom utgitt etter 2017.',
      image: '/images/q7.jpg'
    },
    {
      query: '/search?filter=audience_adult&filter=language_eng&filter=language_nno&filter=language_nob&query=form%3Aroman+NOT+sjanger%3Akriminal+OR+sjanger%3Aspenning&showFilter=audience&showFilter=branch&showFilter=language&showFilter=mediatype&showFullList&showMore=language&yearFrom=2017',
      title: 'Våre nyeste  romaner for voksne',
      desc: 'Her finner du de ferskeste romanene vi har for voksne.',
      image: '/images/q2.jpg'
    },
    {
      query: '/search?filter=audience_ages11To12&filter=audience_ages6To8&filter=fictionNonfiction_fiction&filter=fictionNonfiction_nonfiction&filter=language_nob&filter=mediatype_Book&query=%2A&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=audience&showMore=language&showMore=mediatype&yearFrom=2017',
      title: 'Våre nyeste  barnebøker',
      desc: 'Bla deg gjennom fantasi og fakta for barn mellom 5 og 12.',
      image: '/images/q11.jpg'
    },
    {
      query: 'search?filter=audience_ages11To12&filter=audience_ages13To15&filter=language_eng&filter=language_nno&filter=language_nob&filter=mediatype_Book&query=form%3Aroman+AND+sjanger%3Afantasy+OR+sjanger%3A%22science+fiction%22&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=audience&showMore=language&showMore=mediatype&yearFrom=2012',
      title: 'Fantasy og science fiction for ungdom',
      desc: 'Det finnes mer enn Kattekrigerne, sjekk ut her.',
      image: '/images/q8.jpg'
    },
    {
      query: '/search?filter=audience_adult&filter=language_eng&filter=language_nno&filter=language_nob&filter=mediatype_Book&page=1&query=sjanger%3A%22science+fiction%22+OR+sjanger%3Afantasy&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=language&showMore=mediatype&yearFrom=2012',
      title: 'Fantasy og science  fiction for voksne',
      desc: 'Lev deg inn i andre verdener. Prøv sjangerne fantasy og science fiction.',
      image: '/images/q6.jpg'
    },
    {
      query: '/search?filter=audience_ages11To12&filter=audience_ages9To10&filter=language_nob&filter=mediatype_Book&query=sjanger%3Ahumor&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=audience&showMore=language&showMore=mediatype&yearFrom=2012',
      title: 'Morsomme bøker for deg mellom  9 og 12',
      desc: 'Trenger du å le litt - prøv en bok i sjangeren humor.',
      image: '/images/q12.jpg'
    },
    {
      query: '/search?filter=audience_ages0To2&filter=audience_ages3To5&filter=audience_ages6To8&filter=language_nno&filter=language_nob&filter=mediatype_Book&query=form%3Abildebok&showFilter=audience&showFilter=branch&showFilter=fictionNonfiction&showFilter=language&showFilter=mediatype&showFullList&showMore=audience&showMore=language&showMore=mediatype&yearFrom=2017',
      title: 'Våre nyeste bildebøker for barn',
      desc: 'Oppdag fortellingenes univers sammen med barnet ditt.',
      image: '/images/q9.jpg'
    },
    {
      query: '/search?filter=audience_adult&filter=language_eng&filter=language_nno&filter=language_nob&filter=mediatype_Book&query=sjanger%3Akriminal+OR+sjanger%3Aspenning&showFilter=audience&showFilter=branch&showFilter=language&showFilter=mediatype&showFullList&showMore=language&yearFrom=2017',
      title: 'Krim og spenning for voksne',
      desc: 'De nyeste krimbøkene vi har finner du her.',
      image: '/images/q3.jpg'
    }
  ]
}
