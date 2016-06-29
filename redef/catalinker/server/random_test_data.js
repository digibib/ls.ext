function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function randomName () {
  var name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)
  return capitalizeFirstLetter(name)
}

module.exports = (app) => {
  app.get('/valueSuggestions/random_:source/:isbn', function (request, response) {
      response.json(
        {
          source: request.params.source,
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
                  'deichman:format': {
                    '@id': 'http://data.deichman.no/format#Book'
                  },
                  'deichman:isbn': request.params.isbn,
                  'deichman:language': {
                    '@id': 'http://lexvo.org/id/iso639-3/nob'
                  },
                  'deichman:literaryForm': [
                    {
                      '@id': 'http://data.deichman.no/literaryForm#novel'
                    },
                    {
                      '@id': 'http://data.deichman.no/literaryForm#fiction'
                    }
                  ],
                  'deichman:mainTitle': randomName(),
                  'deichman:publicationOf': {
                    '@id': '_:N788edbeea7104c42adda64d78d844440'
                  },
                  'deichman:publicationYear': {
                    '@type': ['xsd:gYear'],
                    '@value': request.params.source === 'bs' ? '1998' : '2000'
                  },
                  'deichman:recordID': '202417',
                  'http://koha1.deichman.no:8005/raw#locationSignature': 'Dra',
                  'http://koha1.deichman.no:8005/raw#statementOfResponsibility': 'Slavenka Drakulić ; oversatt av Kirsten Korssjøen',
                  'http://migration.deichman.no/binding': 'ib.',
                  'http://migration.deichman.no/creator': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'http://migration.deichman.no/numberOfPages': request.params.source === 'bs' ? '207' : '208',
                  'http://migration.deichman.no/originalLanguage': {
                    '@id': 'http://lexvo.org/id/iso639-3/hrv'
                  },
                  'http://migration.deichman.no/originalTitle': randomName(),
                  'http://migration.deichman.no/publicationPlace': '[Oslo]',
                  'http://migration.deichman.no/publisher': 'Gyldendal',
                  'http://migration.deichman.no/subjectAuthority': {
                    '@id': 'http://koha1.deichman.no:8005/bsSubjectAuthority/kjaerlighet_fortellinger'
                  }
                },
                {
                  '@id': '_:Nfa97dd73eff64195a220cdea3a16afde',
                  '@type': ['deichman:Contribution'],
                  'deichman:agent': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'deichman:role': {
                    '@id': request.params.source === 'bs' ? 'http://data.deichman.no/role#author' : 'http://data.deichman.no/role#composer'
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
                  'http://koha1.deichman.no:8005/raw#lifeSpan': '1949-'
                },
                {
                  '@id': '_:N788edbeea7104c42adda64d78d844440',
                  '@type': ['deichman:Work'],
                  'deichman:audience': {
                    '@id': request.params.source === 'bs' ?  'http://data.deichman.no/audience#adult' : 'http://data.deichman.no/audience#juvenile'
                  },
                  'deichman:contributor': {
                    '@id': '_:N61c1076a2d094a67995a293daec3b879'
                  },
                  'deichman:creator': {
                    '@id': '_:N9fdb7e0d043e44708df915d456bbb132'
                  },
                  'deichman:language': {
                    '@id': request.params.source === 'bs' ? 'http://lexvo.org/id/iso639-3/hrv' : 'http://lexvo.org/id/iso639-3/swe'
                  },
                  'deichman:literaryForm': [
                    {
                      '@id': request.params.source === 'bs' ? 'http://data.deichman.no/literaryForm#fiction' : 'http://data.deichman.no/literaryForm#drama'
                    },
                    {
                      '@id': request.params.source === 'bs' ?  'http://data.deichman.no/literaryForm#novel' : 'http://data.deichman.no/literaryForm#pointingBook'
                    }
                  ],
                  'deichman:mainTitle': randomName()
                },
                {
                  '@id': 'http://data.deichman.no/format#Book',
                  '@type': 'http://data.deichman.no/utility#Format',
                  'http://data.deichman.no/utility#code': 'l',
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
                    '@id': request.params.source === 'bs' ? 'http://data.deichman.no/role#author' : 'http://data.deichman.no/role#conductor'
                  }
                },
                {
                  '@id': '_:N0d3f253e2e624cf49c45d545fbf5a41f',
                  '@type': ['deichman:Contribution'],
                  'deichman:agent': {
                    '@id': '_:N5c9b2fcaef3246c295aa6fc121e7b155'
                  },
                  'deichman:role': {
                    '@id': request.params.source === 'bs' ?  'http://data.deichman.no/role#translator' :  'http://data.deichman.no/role#coreographer'
                  }
                }
              ]
            }
          ]
        }
      )
    }
  )
}
