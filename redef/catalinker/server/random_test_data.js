const _ = require('underscore')

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function randomName () {
  var name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)
  return capitalizeFirstLetter(name)
}

module.exports = (app) => {
  app.get(/\/valueSuggestions\/random_([^\/]*)/, function (request, response) {
    var source = request.params[0]
    var param = _(request.query).keys().find((key)=>{return _.contains(['isbn','ean', 'title', 'author', 'local_id'],key)})
    var term = request.query[param]
    response.json(
        {
          source: source,
          hits: [
            {
              '@context': {
                'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
                'deichman': 'http://192.168.50.12:8005/ontology#',
                'xsd': 'http://www.w3.org/2001/XMLSchema#'
              },
              '@graph': [
                {
                  '@id': '_:N62bb7e44e5414c30905dacfa3f3ad263',
                  '@type': ['deichman:Publication'],
                  'deichman:audience': {
                    '@id': 'http://data.deichman.no/audience#adult'
                  },
                  'deichman:bibliofilPublicationID': '0502300',
                  'deichman:contributor': [
                    {
                      '@id': '_:Nfa97dd73eff64195a220cdea3a16afde'
                    },
                    {
                      '@id': '_:N0d3f253e2e624cf49c45d545fbf5a41f'
                    }
                  ],
                  'deichman:hasMediaType': {
                    '@id': 'http://data.deichman.no/mediaType#Book'
                  },
                  'deichman:isbn': term,
                  'deichman:language': {
                    '@id': source === 'bibbi' ? 'http://lexvo.org/id/iso639-3/hrv' : 'http://lexvo.org/id/iso639-3/swe'
                  },
                  'deichman:literaryForm': [
                    {
                      '@id': 'http://data.deichman.no/literaryForm#novel'
                    },
                    {
                      '@id': 'http://data.deichman.no/literaryForm#shortProse'
                    }
                  ],
                  'deichman:mainTitle': randomName(),
                  'deichman:publicationOf': {
                    '@id': '_:N788edbeea7104c42adda64d78d844440'
                  },
                  'deichman:publicationYear': {
                    '@type': ['xsd:gYear'],
                    '@value': source === 'bibbi' ? '1998' : '2000'
                  },
                  'deichman:recordId': '202417',
                  'http://koha1.deichman.no:8005/raw#locationSignature': 'Dra',
                  'http://koha1.deichman.no:8005/raw#statementOfResponsibility': 'Slavenka Drakulić ; oversatt av Kirsten Korssjøen',
                  'http://migration.deichman.no/binding': 'ib.',
                  'http://migration.deichman.no/creator': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'http://migration.deichman.no/numberOfPages': source === 'bibbi' ? '207' : '208',
                  "deichman:hasPublicationPart": [
                    {
                      "@id": "_:b9"
                    },
                    {
                      "@id": "_:b10"
                    },
                    {
                      "@id": "_:b12"
                    }
                    ],
                  'http://migration.deichman.no/originalLanguage': {
                    '@id': 'http://lexvo.org/id/iso639-3/hrv'
                  },
                  'http://migration.deichman.no/originalTitle': randomName(),
                  'http://migration.deichman.no/publicationPlace': '[Oslo]',
                  'http://migration.deichman.no/publisher': 'Gyldendal',
                  'http://migration.deichman.no/subjectAuthority': {
                    '@id': 'http://koha1.deichman.no:8005/bsSubjectAuthority/kjaerlighet_fortellinger'
                  },
                  "deichman:hasPrimaryCataloguingSource": {
                    "@id": "http://data.deichman.no/cataloguingSource#BS"
                  },
                  "deichman:hasIdentifierInPrimaryCataloguingSource": "0506642"
                },
                {
                  '@id': '_:Nfa97dd73eff64195a220cdea3a16afde',
                  '@type': ['deichman:Contribution'],
                  'deichman:agent': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'deichman:role': {
                    '@id': source === 'bibbi' ? 'http://data.deichman.no/role#author' : 'http://data.deichman.no/role#composer'
                  }
                },
                {
                  '@id': '_:N5c9b2fcaef3246c295aa6fc121e7b155',
                  '@type': ['deichman:Person'],
                  'http://data.deichman.no/duo#bibliofilPersonId': '19887600',
                  'deichman:birthYear': '1949',
                  'deichman:name': randomName() + ', ' + randomName(),
                  'deichman:nationality': {
                    '@id': 'http://data.deichman.no/nationality#n'
                  },
                  'http://koha1.deichman.no:8005/raw#lifeSpan': '1939-'
                },
                {
                  '@id': '_:N788edbeea7104c42adda64d78d844440',
                  '@type': ['deichman:Work', 'deichman:TopBanana'],
                  'deichman:audience': {
                    '@id': source === 'bibbi' ?  'http://data.deichman.no/audience#adult' : 'http://data.deichman.no/audience#juvenile'
                  },
                  'deichman:contributor': {
                    '@id': '_:N61c1076a2d094a67995a293daec3b879'
                  },
                  'deichman:creator': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'deichman:language': {
                    '@id': source === 'bibbi' ? 'http://lexvo.org/id/iso639-3/hrv' : 'http://lexvo.org/id/iso639-3/swe'
                  },
                  'deichman:literaryForm': [
                    {
                      '@id': source === 'bibbi' ? 'http://data.deichman.no/literaryForm#shortProse' : 'http://data.deichman.no/literaryForm#drama'
                    },
                    {
                      '@id': source === 'bibbi' ?  'http://data.deichman.no/literaryForm#novel' : 'http://data.deichman.no/literaryForm#pointingBook'
                    }
                  ],
                  'deichman:mainTitle': randomName(),
                  'deichman:nationality': {
                    '@id': '_:b100'
                  }
                },
                {
                  '@id': 'http://data.deichman.no/format#Book',
                  '@type': 'http://data.deichman.no/utility#Format',
                  'rdfs:label': [
                    {
                      '@language': 'no',
                      '@value': 'Bok'
                    },
                    {
                      '@language': 'en',
                      '@value': 'Book'
                    }
                  ]
                },
                {
                  '@id': '_:b100',
                  '@type': 'http://data.deichman.no/utility#nationality',
                  'rdfs:label': [
                    {
                      '@language': 'no',
                      '@value': 'Slaraffenland'
                    }
                  ]
                },
                {
                  '@id': '_:N9fdb7e0d043e44708df915d456bbb132',
                  '@type': ['deichman:Person'],
                  'http://data.deichman.no/duo#bibliofilPersonId': '29406800',
                  'deichman:birthYear': '1949',
                  'deichman:name': randomName() + ', ' + randomName(),
                  'deichman:nationality': {
                    '@id': 'http://data.deichman.no/nationality#kroat'
                  },
                  'http://koha1.deichman.no:8005/raw#lifeSpan': '1949-'
                },
                {
                  '@id': '_:N61c1076a2d094a67995a293daec3b879',
                  '@type': [
                    'deichman:Contribution',
                    'deichman:MainEntry'
                  ],
                  'deichman:agent': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'deichman:role': {
                    '@id': source === 'bibbi' ? 'http://data.deichman.no/role#author' : 'http://data.deichman.no/role#conductor'
                  }
                },
                {
                  '@id': '_:N0d3f253e2e624cf49c45d545fbf5a41f',
                  '@type': ['deichman:Contribution'],
                  'deichman:agent': {
                    '@id': '_:N5c9b2fcaef3246c295aa6fc121e7b155'
                  },
                  'deichman:role': {
                    '@id': source === 'bibbi' ?  'http://data.deichman.no/role#translator' :  'http://data.deichman.no/role#coreographer'
                  }
                },
                {
                  "deichman:improperWork": false,
                  "deichman:mainTitle": "En gammeldags julaften",
                  "deichman:agent": {
                    "@id": "_:b8"
                  },
                  "deichman:role": {
                    "@id": "http://data.deichman.no/role#author"
                  },
                  "@type": [
                    "deichman:PublicationPart"
                  ],
                  "@id": "_:b9"
                },
                {
                  "deichman:improperWork": false,
                  "deichman:mainTitle": "Tittel uten bidragsyter",
                  "@type": [
                    "deichman:PublicationPart"
                  ],
                  "@id": "_:b12"
                },
                {
                  "deichman:improperWork": false,
                  "deichman:mainTitle": "En jul jeg aldri glemmer",
                  "deichman:agent": {
                    "@id": "_:b11"
                  },
                  "@type": [
                    "deichman:PublicationPart"
                  ],
                  "@id": "_:b10"
                },
                {
                  "deichman:birthYear": "1812",
                  "deichman:deathYear": "1885",
                  "deichman:nationality": [
                    {
                      "@id": "http://data.deichman.no/nationality#n"
                    }
                  ],
                  "deichman:name": "Asbjørnsen, Peter Christen",
                  "@type": [
                    "deichman:Person"
                  ],
                  "@id": "_:b8"
                },
                {
                  "deichman:birthYear": "1812",
                  "deichman:deathYear": "1885",
                  "deichman:nationality": [
                    {
                      "@id": "http://data.deichman.no/nationality#n"
                    }
                  ],
                  "deichman:name": "Olderbolle, Kåre",
                  "@type": [
                    "deichman:Person"
                  ],
                  "@id": "_:b11"
                }
              ]
            }
          ]
        }
      )
    }
  )
}
