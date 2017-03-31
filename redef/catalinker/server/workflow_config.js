var _ = require('underscore')
function maintenanceInputs (label, type) {
  return {
    // this is an input type used to search for a main resource, e.g. Work. The rendered input field
    // will not be tied to a particular subject and predicate
    searchMainResource: {
      label: label,
      indexType: type
    },
    // this is used to control how the search result in the support panel behaves
    widgetOptions: {
      maintenance: true,
      // make it possible to create a work resource if necessary,
      enableCreateNewResource: {
        formRefs: [ {
          formId: 'create-' + type + '-form',
          targetType: type
        } ]
      },
      enableEditResource: {
        formRefs: [ {
          formId: 'create-' + type + '-form',
          targetType: type
        } ]
      },
      enableInPlaceEditing: true
    }
  }
}

function createdTimestamp () {
  return {
    rdfProperty: 'created',
    readOnly: true,
    oneLiner: true
  }
}

function modifiedTimestamp () {
  return {
    rdfProperty: 'modified',
    readOnly: true,
    oneLiner: true
  }
}

module.exports = (app) => {
  app.get('/config', function (request, response) {
    response.setHeader('Cache-Control', 'public, max-age=3600')
    response.setHeader('Expires', new Date(Date.now() + 3600000).toUTCString())
    const typeMap = {
      // this map contains a map of all known independent resource types (i.e. not blank node types) as they appear in
      // resource urls and their canonical names
      work: 'Work',
      person: 'Person',
      publication: 'Publication',
      genre: 'Genre',
      subject: 'Subject',
      place: 'Place',
      event: 'Event',
      serial: 'Serial',
      corporation: 'Corporation',
      instrument: 'Instrument',
      compositionType: 'CompositionType',
      workSeries: 'WorkSeries',
    }
    const personCorpNameProperties = [
      'prefLabel',
      'name,',
      {
        person: '#ordinal,',
        event: '(ordinal).'
      },
      'subdivision',
      {
        'corporation|subject|work|place|genre|compositiontype|instrument': '(specification)',
        person: 'specification,'
      },
      'birthYear-', 'deathYear,',
      'nationality.fragment.'
    ]
    var config =
      {
        kohaOpacUri: (process.env.KOHA_OPAC_PORT || 'http://192.168.50.12:8080').replace(/^tcp:\//, 'http:/'),
        kohaIntraUri: (process.env.KOHA_INTRA_PORT || 'http://192.168.50.12:8081').replace(/^tcp:\//, 'http:/'),
        ontologyUri: '/services/ontology',
        resourceApiUri: '/services/',
        inputForms: [
          {
            id: 'create-person-form',
            rdfType: 'Person',
            labelForCreateButton: 'Opprett ny person',
            inputs: [
              {
                rdfProperty: 'name',
                displayValueSource: true,
                // after resource is created, the value entered
                // in input marked with this is used to populate displayValue of the parent input
                preFillFromSearchField: true,
                type: 'input-string'
              },
              {
                rdfProperty: 'birthYear',
                prefillFromSuggestion: true
              },
              {
                rdfProperty: 'deathYear'
              },
              {
                rdfProperty: 'nationality',
                multiple: true
              },
              {
                rdfProperty: 'gender'
              },
              {
                rdfProperty: 'specification',
                type: 'input-string-large'
              },
              {
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              {
                rdfProperty: 'ordinal',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-subject-form',
            labelForCreateButton: 'Opprett nytt generelt emne',
            rdfType: 'Subject',
            inputs: [
              {
                rdfProperty: 'prefLabel',
                displayValueSource: true,
                type: 'input-string',
                // after resource is created, the value entered
                // in input marked with this is used to populate displayValue of the parent input
                preFillFromSearchField: true
              },
              {
                rdfProperty: 'specification',
                type: 'input-string-large'
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-genre-form',
            labelForCreateButton: 'Opprett ny sjanger',
            rdfType: 'Genre',
            inputs: [
              {
                rdfProperty: 'prefLabel',
                displayValueSource: true,
                type: 'input-string',
                // after resource is created, the value entered
                // in input marked with this is used to populate displayValue of the parent input
                preFillFromSearchField: true
              },
              {
                rdfProperty: 'specification',
                type: 'input-string-large'
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-corporation-form',
            labelForCreateButton: 'Opprett ny organisasjon',
            rdfType: 'Corporation',
            inputs: [
              {
                rdfProperty: 'name',
                displayValueSource: true,
                type: 'input-string',
                // after resource is created, the value entered
                // in input marked with this is used to populate displayValue of the parent input
                preFillFromSearchField: true
              },
              {
                rdfProperty: 'subdivision',
                type: 'input-string'
              },
              {
                label: 'Sted',
                rdfProperty: 'place',
                type: 'searchable-authority-dropdown',
                indexTypes: 'place',
                indexDocumentFields: [ 'prefLabel' ]
              },
              {
                label: 'Forklarende tilføyelse',
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-main-work-form',
            prefillFromAcceptedSource: true,
            labelForCreateButton: 'Opprett nytt verk',
            rdfType: 'Work',
            inputs: [
              {
                label: 'Hovedtittel',
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                label: 'Undertittel',
                type: 'input-string',
                rdfProperty: 'subtitle'
              },
              {
                label: 'Deltittel',
                type: 'input-string',
                rdfProperty: 'partTitle'
              },
              {
                label: 'Delnummer',
                type: 'input-string',
                rdfProperty: 'partNumber'
              },
              {
                rdfProperty: 'hasWorkType',
                type: 'hidden-url-query-value',
                widgetOptions: {
                  queryParameter: 'hasWorkType',
                  prefix: 'http://data.deichman.no/workType#'
                }
              }
            ]
          },
          {
            id: 'create-work-form',
            labelForCreateButton: 'Opprett nytt verk',
            rdfType: 'Work',
            inputs: [
              {
                label: 'Hovedtittel',
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                label: 'Undertittel',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'subtitle'
              },
              {
                label: 'Deltittel',
                type: 'input-string',
                rdfProperty: 'partTitle'
              },
              {
                label: 'Delnummer',
                type: 'input-string',
                rdfProperty: 'partNumber'
              },
              {
                rdfProperty: 'hasWorkType'
              }
            ]
          },
          {
            id: 'create-workseries-form',
            labelForCreateButton: 'Opprett ny verksserie',
            rdfType: 'WorkSeries',
            inputs: [
              {
                label: 'Serietittel',
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                label: 'Undertittel',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'subtitle'
              },
              {
                label: 'Nummer på delserie',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'partNumber'
              },
              {
                label: 'Tittel på delserie',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'partTitle'
              }
            ]
          },
          {
            id: 'create-place-form',
            labelForCreateButton: 'Opprett nytt sted',
            rdfType: 'Place',
            inputs: [
              {
                label: 'Navn',
                rdfProperty: 'prefLabel',
                displayValueSource: true,
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true // value of this field should be copied from the search field above
              },
              {
                label: 'Forklarende tilføyelse',
                rdfProperty: 'specification',
                type: 'input-string'
                // input type must be defined explicitly, otherwise it will inherit from the search field above
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-event-form',
            labelForCreateButton: 'Opprett ny hendelse',
            rdfType: 'Event',
            inputs: [
              {
                label: 'Navn',
                rdfProperty: 'prefLabel',
                displayValueSource: true,
                type: 'input-string',
                preFillFromSearchField: true // value of this field should be copied from the search field above
              },
              {
                label: 'Sted',
                rdfProperty: 'place',
                type: 'searchable-authority-dropdown',
                indexTypes: 'place',
                indexDocumentFields: [ 'prefLabel' ]
              },
              {
                label: 'Nummer',
                rdfProperty: 'ordinal',
                type: 'input-string'
              },
              {
                label: 'Dato',
                rdfProperty: 'date',
                type: 'input-string'
              },
              {
                label: 'Forklarende tilføyelse',
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-serial-form',
            labelForCreateButton: 'Opprett ny serie',
            rdfType: 'Serial',
            inputs: [
              {
                label: 'Serietittel',
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                label: 'Undertittel',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'subtitle'
              },
              {
                label: 'Nummer på delserie',
                type: 'input-string',
                rdfProperty: 'partNumber'
              },
              {
                label: 'Tittel på delserie',
                type: 'input-string',
                rdfProperty: 'partTitle'
              },
              {
                label: 'ISSN',
                type: 'input-string',
                rdfProperty: 'issn'
              },
              {
                label: 'Utgiver',
                rdfProperty: 'publishedBy',
                type: 'searchable-authority-dropdown',
                indexTypes: 'corporation',
                nameProperties: [ 'name', 'subdivision', 'placePrefLabel', '(specification)' ],
                indexDocumentFields: [ 'name', 'subdivision', 'placePrefLabel', 'specification' ]
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-instrument-form',
            labelForCreateButton: 'Opprett nytt musikkinstrument',
            rdfType: 'Instrument',
            inputs: [
              {
                label: 'Navn',
                rdfProperty: 'prefLabel',
                type: 'input-string',
                preFillFromSearchField: true
              },
              {
                label: 'Forklarende tilføyelse',
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-compositiontype-form',
            labelForCreateButton: 'Opprett ny komposisjonstype',
            rdfType: 'CompositionType',
            inputs: [
              {
                label: 'Navn',
                rdfProperty: 'prefLabel',
                type: 'input-string',
                preFillFromSearchField: true
              },
              {
                label: 'Forklarende tilføyelse',
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
                label: 'Alternativt navn',
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          }
        ],
        tabs: [
          {
            id: 'confirm-person',
            rdfType: 'Work',
            label: 'Hovedinnførsel',
            inputs: [
              {
                id: 'isbnInput',
                includeOnlyWhen: {
                  hasMediaType: [ 'Book', 'Audiobook', 'SheetMusic', 'ComicBook', 'LanguageCourse', 'E-book' ]
                },
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchForValueSuggestions: {
                  label: 'ISBN',
                  pattern: '^[ 0-9\\-]+[xX]?\\s*$',
                  formatter: 'isbn',
                  patternMismatchMessage: 'Dette ser ikke ut som et gyldig ISBN-nummer',
                  parameterName: 'isbn',
                  automationId: 'searchValueSuggestions',
                  showOnlyWhenMissingTargetUri: 'Work', // only show this search field if a work has not been loaded or created
                  sources: [ 'bibbi' ],
                  preferredSource: {
                    id: 'bibbi',
                    name: 'Biblioteksentralen'
                  },
                  checkExistingResource: {
                    url: 'services/publication/isbn',
                    queryParameter: 'isbn',
                    type: 'Publication',
                    legendSingular: 'Det finnes allerede en registrert utgivelse med samme ISBN-nummer. Vil du åpne den, fortsette med nyregistrering likevel, eller avbryte registreringen?',
                    legendPlural: 'Det finnes allerede ${numberOfResources} registrerte utgivelser med samme ISBN-nummer. Vil du åpne en av disse, fortsette med nyregistrering likevel, eller avbryte registreringen?',
                    editWithTemplate: {
                      template: 'workflow',
                      descriptionKey: 'maintPub'
                    }
                  }
                }
              },
              {
                includeOnlyWhen: {
                  hasMediaType: [ 'Film', 'MusicRecording', 'Game' ]
                },
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchForValueSuggestions: {
                  label: 'EAN',
                  pattern: '^ *([0-9]{13})?\\s*$',
                  patternMismatchMessage: 'Dette ser ikke ut som et gyldig EAN-nummer',
                  parameterName: 'ean',
                  automationId: 'searchEanValueSuggestions',
                  showOnlyWhenMissingTargetUri: 'Work', // only show this search field if a work has not been loaded or created
                  sources: [ 'bibbi' ],
                  preferredSource: {
                    id: 'bibbi',
                    name: 'Biblioteksentralen'
                  },
                  checkExistingResource: {
                    url: 'services/publication',
                    queryParameter: 'hasEan',
                    showDetails: [ 'mainTitle', 'subtitle', 'partNumber', 'partTitle', 'publicationYear' ],
                    type: 'Publication',
                    legendSingular: 'Det finnes allerede en registrert utgivelse med samme EAN-nummer. Vil du åpne den, fortsette med nyregistrering likevel, eller avbryte registreringen?',
                    legendPlural: 'Det finnes allerede ${numberOfResources} registrerte utgivelser med samme EAN-nummer. Vil du åpne en av disse, fortsette med nyregistrering likevel, eller avbryte registreringen?',
                    editWithTemplate: {
                      template: 'workflow',
                      descriptionKey: 'maintPub'
                    }
                  }
                }
              },
              {
                label: 'Verket har ikke hovedansvarlig',
                id: 'missingMainEntry',
                rdfProperty: 'missingMainEntry'
              },
              {
                label: 'Hovedansvarlig',
                id: 'mainEntryInput',
                reportFormat: {
                  list: true
                },
                showOnlyWhen: {
                  inputId: 'missingMainEntry',
                  valueAsStringMatches: '^false$|^null$|^undefined'
                },
                subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
                  rdfProperty: 'contributor', // the rdf property of the resource
                  range: 'Contribution', // this is the shorthand name of the type of the blank node
                  inputs: [ // these are the actual sub inputs
                    {
                      label: 'Aktør',
                      rdfProperty: 'agent',
                      indexTypes: [ 'person', 'corporation' ],
                      type: 'searchable-with-result-in-side-panel',
                      required: true,
                      nameProperties: personCorpNameProperties,
                      previewProperties: [ {
                        person: '#ordinal,',
                        event: '(ordinal).'
                      },
                        'subdivision',
                        {
                          corporation: '(specification)',
                          person: 'specification,'
                        },
                        'placePrefLabel,', 'birthYear-', 'deathYear', 'nationality.fragment.' ],
                      dependentResourceTypes: [ 'Work', 'Publication' ], // when the creator is changed, unload current work and publication
                      id: 'mainEntryPersonInput',
                      widgetOptions: {
                        showSelectItem: true, // show and enable select work radio button
                        enableCreateNewResource: {
                          formRefs: [
                            {
                              formId: 'create-person-form',
                              targetType: 'person'
                            },
                            {
                              formId: 'create-corporation-form',
                              targetType: 'corporation'
                            }
                          ],
                          useAfterCreation: false
                        }
                      },
                      headlinePart: {
                        order: 10
                      }
                    },
                    {
                      id: 'mainEntryRoleInput',
                      label: 'Rolle',
                      rdfProperty: 'role',
                      required: true
                    }
                  ]
                },
                isMainEntry: true,
                // blank nodes connected to this input is expected to have type deichman:MainEntry in addition to its own type (range)
                subjects: [ 'Work' ], // blank node can be attached to the the loaded resource of one of these types
                cssClassPrefix: 'additional-entries' // prefix of class names to identify a span surrounding this input or group of sub inputs.
                // actual names are <prefix>-non-editable and <prefix>-editable to enable alternative presentation when not editable
              },
              {
                label: 'Skal ikke inngå i verksliste',
                rdfProperty: 'improperWork'
              },
              {
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                id: 'searchMainResourceInput',
                isTitleSource: {
                  priority: 3,
                  qualifier: ' - verk'
                },
                searchMainResource: {
                  label: 'Søk etter eksisterende verk',
                  indexType: 'work',
                  automationId: 'searchWorkAsMainResource',
                  showOnlyWhenMissingTargetUri: 'Work' // only show this search field if a work has not been loaded or created
                },
                suggestValueFrom: {
                  domain: 'Work',
                  predicate: '#mainTitle'
                },
                // this is used to control how the search result in the support panel behaves
                widgetOptions: {
                  // make it possible to create a work resource if necessary,
                  enableCreateNewResource: {
                    formRefs: [ {
                      formId: 'create-main-work-form',
                      targetType: 'work'
                    } ],
                    useAfterCreation: true
                  },
                  filter: {
                    inputRef: 'mainEntryPersonInput',
                    name: 'personAsMainEntryFilter'
                  }
                }
              }
            ],
            nextStep: {
              showOnlyWhenInputHasValue: 'mediaTypeInput',
              buttonLabel: 'Neste steg: Beskrivelse',
              disabledUnless: {
                presentTargetUri: 'Work',
                inputIsNonEditableWhenNotOverridden: {
                  nonEditableInput: 'mainEntryPersonInput',
                  overridingInput: 'missingMainEntry'
                },
                disabledTooltip: 'For å komme videre, må du registrere hovedinnførsel og idenfisere eller opprette verk.'
              },
              createNewResource: {
                type: 'Publication',
                prefillValuesFromResource: {
                  'Work': [ 'mainTitle', 'subtitle', 'partTitle', 'partNumber' ]
                }
              }
            }
          },
          {
            id: 'describe-publication',
            rdfType: 'Publication',
            label: 'Beskriv utgivelse',
            reportLabel: 'Utgivelse',
            inputs: [
              {
                rdfProperty: 'mainTitle',
                id: 'publicationMainTitle',
                isTitleSource: {
                  priority: 1,
                  qualifier: ' - utgivelse'
                },
                headlinePart: {
                  order: 20,
                  styleClass: 'title'
                }
              },
              {
                rdfProperty: 'subtitle',
                headlinePart: {
                  order: 30,
                  styleClass: 'title'
                }
              },
              {
                rdfProperty: 'partTitle',
                headlinePart: {
                  order: 40,
                  styleClass: 'title'
                }
              },
              { rdfProperty: 'partNumber' },
              { rdfProperty: 'edition' },
              {
                rdfProperty: 'publicationYear',
                headlinePart: {
                  order: 60,
                  prefix: '(',
                  postfix: ')'
                }
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'ComicBook', 'LanguageCourse', 'SheetMusic' ] },
                rdfProperty: 'numberOfPages',
                multiple: true,
                addAnotherLabel: 'Legg til et sidetall'
              },
              {
                rdfProperty: 'hasExtent',
                addAnotherLabel: 'Legg til et omfang'
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'SheetMusic', 'ComicBook', 'LanguageCourse', 'E-book' ] },
                rdfProperty: 'illustrativeMatter',
                multiple: true
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'Audiobook', 'SheetMusic', 'ComicBook', 'LanguageCourse', 'E-book' ] },
                rdfProperty: 'isbn',
                multiple: true,
                formatter: 'isbn',
                addAnotherLabel: 'Legg til nytt ISBN'
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'SheetMusic' ] },
                rdfProperty: 'hasIsmn',
                multiple: true,
                addAnotherLabel: 'Legg til nytt ISMN'
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'Audiobook', 'SheetMusic', 'ComicBook', 'LanguageCourse', 'E-book', 'Film', 'MusicRecording', 'Game' ] },
                rdfProperty: 'hasEan'
              },
              {
                includeOnlyWhen: {
                  hasMediaType: [ 'Other', 'Book', 'SheetMusic', 'LanguageCourse', 'ComicBook' ]
                },
                rdfProperty: 'binding'
              },
              {
                rdfProperty: 'language',
                multiple: true
              },
              {
                includeOnlyWhen: {
                  hasMediaType: [ 'Film', 'Game' ]
                },
                rdfProperty: 'hasSubtitles',
                multiple: 'true'
              },
              {
                rdfProperty: 'hasMediaType',
                id: 'mediaTypeInput',
                widgetOptions: {
                  queryParameter: 'hasMediaType',
                  prefix: 'http://data.deichman.no/mediaType#'
                }
              },
              { rdfProperty: 'format', multiple: true },
              {
                includeOnlyWhen: {
                  hasMediaType: [ 'Other', 'Film', 'MusicRecording', 'Audiobook', 'LanguageCourse' ]
                },
                rdfProperty: 'duration',
                type: 'input-duration'
              },
              {
                includeOnlyWhen: {
                  hasMediaType: [ 'Other', 'Film', 'Game' ]
                },
                rdfProperty: 'ageLimit',
                widgetOptions: {
                  short: true
                }
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'E-bok', 'ComicBook', 'SheetMusic' ] },
                rdfProperty: 'writingSystem',
                multiple: true
              },
              { rdfProperty: 'hasFormatAdaptation', multiple: true },
              {
                id: 'publishedByInput',
                rdfProperty: 'publishedBy',
                authority: true, // this indicates it is an authorized entity
                nameProperties: [
                  {
                    person: 'name,',
                    corporation: 'name.'
                  },
                  {
                    person: '#ordinal,',
                    event: '(ordinal).'
                  },
                  'subdivision',
                  {
                    corporation: '(specification)',
                    person: 'specification,'
                  },
                  'placePrefLabel,',
                  'birthYear-', 'deathYear'
                ],
                indexTypes: [ 'corporation', 'person' ], // this is the name of the elasticsearch index type from which authorities are searched within
                preselectFirstIndexType: true,
                // or authority select list are concatenated
                type: 'searchable-with-result-in-side-panel',
                widgetOptions: {
                  selectIndexTypeLegend: 'Velg type aktør',
                  enableCreateNewResource: {
                    formRefs: [
                      {
                        formId: 'create-corporation-form',
                        targetType: 'corporation'
                      },
                      {
                        formId: 'create-person-form',
                        targetType: 'person'
                      }
                    ]
                  }
                },
                headlinePart: {
                  order: 50
                }
              },
              {
                id: 'hasPlaceOfPublicationInput',
                rdfProperty: 'hasPlaceOfPublication',
                authority: true, // this indicates it is an authorized entity
                nameProperties: [ 'prefLabel', 'specification' ], // these are property names used to label already connected entities
                indexTypes: 'place', // this is the name of the elasticsearch index type from which authorities are searched within
                // the labels for authority select list are concatenated
                type: 'searchable-with-result-in-side-panel',
                widgetOptions: {
                  enableCreateNewResource: {
                    formRefs: [ {
                      formId: 'create-place-form',
                      targetType: 'place'
                    } ]
                  }
                }
              },
              {
                label: 'Serie',
                multiple: true,
                addAnotherLabel: 'Legg til ny serie',
                subjects: [ 'Publication' ],
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'inSerial',
                  range: 'SerialIssue',
                  inputs: [
                    {
                      label: 'Serie',
                      required: true,
                      rdfProperty: 'serial',
                      id: 'serialInput',
                      indexTypes: 'serial',
                      nameProperties: [ 'mainTitle', 'subtitle' ],
                      type: 'searchable-with-result-in-side-panel',
                      widgetOptions: {
                        showSelectItem: false, // show and enable select work radio button
                        enableCreateNewResource: {
                          formRefs: [ {
                            formId: 'create-serial-form',
                            targetType: 'serial'
                          } ],
                          useAfterCreation: false
                        }
                      }
                    },
                    {
                      label: 'Nummer i serien',
                      rdfProperty: 'issue'
                    }
                  ]
                }
              },
              { rdfProperty: 'locationFormat' },
              { rdfProperty: 'locationClassNumber' },
              { rdfProperty: 'locationSignature' },
              {
                rdfProperty: 'hasDescription',
                type: 'input-string-large'
              },
              {
                rdfProperty: 'publicationOf',
                id: 'publicationOfInput',
                type: 'searchable-with-result-in-side-panel',
                indexTypes: 'work',
                authority: true,
                nameProperties: [ 'mainTitle', 'subtitle' ],
                label: '',
                initiallyHidden: true,
                dependentResourceTypes: [ 'Work' ], // unload work if this is cleared
                widgetOptions: {
                  // make it possible to create a work resource if necessary,
                  enableCreateNewResource: {
                    formRefs: [ {
                      formId: 'create-work-form',
                      targetType: 'work'
                    } ]
                  }
                }
              },
              createdTimestamp(),
              modifiedTimestamp()
            ],
            nextStep: {
              buttonLabel: 'Neste steg: Beskriv verk',
              showOnlyWhenInputHasValue: 'mediaTypeInput'
            },
            deleteResource: {
              buttonLabel: 'Slett utgivelsen',
              rdfType: 'Publication',
              dialogKeypath: 'deletePublicationDialog',
              dialogId: 'delete-publication-dialog',
              dialogTemplateValues: {
                work: 'workMainTitle',
                title: 'publicationMainTitle',
                creator: 'mainEntryPersonInput'
              },
              afterSuccess: {
                restart: true
              }
            },
            enableSpecialInput: {
              inputId: 'publicationOfInput',
              buttonLabel: 'Endre verk for utgivelse',
              confirmLabel: 'Er du sikker på at du vil endre verksknytningen for denne utgivelsen?'
            }
          },
          {
            id: 'describe-work',
            rdfType: 'Work',
            label: 'Beskriv verk',
            reportLabel: 'Verk',
            inputs: [
              {
                id: 'workMainTitle',
                rdfProperty: 'mainTitle',
                isTitleSource: {
                  priority: 2,
                  qualifier: ' - verk'
                }
              },
              {
                rdfProperty: 'subtitle',
                id: 'workSubtitle'
              },
              {
                rdfProperty: 'partTitle',
                id: 'workPartTitle'
              },
              {
                rdfProperty: 'partNumber',
                id: 'workPartNumber'
              },
              {
                rdfProperty: 'publicationYear',
                label: 'År',
                id: 'workPublicationYear'
              },
              {
                rdfProperty: 'nationality',
                label: 'Opprinnelsesland',
                multiple: 'true'
              },
              { rdfProperty: 'language', multiple: true },
              {
                rdfProperty: 'hasWorkType',
                id: 'workTypeInput',
                widgetOptions: {
                  queryParameter: 'hasWorkType',
                  prefix: 'http://data.deichman.no/workType#'
                }
              },
              {
                includeOnlyWhen: { hasWorkType: [ 'Other', 'Literature', 'Film' ] },
                rdfProperty: 'literaryForm',
                multiple: true,
                headlinePart: {
                  order: 45
                }
              },
              {
                includeOnlyWhen: { hasWorkType: [ 'Other', 'Literature', 'Film' ] },
                rdfProperty: 'fictionNonfiction'
              },
              { rdfProperty: 'audience', multiple: true },
              {
                includeOnlyWhen: { hasWorkType: [ 'Other', 'Literature', 'Film' ] },
                rdfProperty: 'biography',
                multiple: true
              },
              { rdfProperty: 'hasContentAdaptation', multiple: true },
              {
                label: 'Relasjon til annet verk',
                multiple: true,
                addAnotherLabel: 'Legg til en relasjon til',
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'isRelatedTo',
                  range: 'WorkRelation',
                  inputs: [
                    {
                      label: 'Verk',
                      rdfProperty: 'work',
                      id: 'relatedToWorkInput',
                      required: true,
                      indexTypes: [ 'workUnstructured' ],
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'mainTitle', 'subtitle', 'partNumber', 'partTitle' ],
                      widgetOptions: {
                        enableCreateNewResource: {
                          formRefs: [
                            {
                              formId: 'create-work-form',
                              targetType: 'workUnstructured'
                            }
                          ],
                          useAfterCreation: false
                        }
                      }
                    },
                    {
                      label: 'Type relasjon',
                      rdfProperty: 'hasRelationType',
                      required: true,
                      id: 'relationTypeInput'
                    },
                    {
                      label: 'Del nummer',
                      rdfProperty: 'partNumber',
                      id: 'partNumberInput',
                      showOnlyWhen: {
                        inputId: 'relationTypeInput',
                        valueAsStringMatches: '^.*partOf$',
                        initial: 'hide'
                      }
                    }
                  ]
                },
                subjects: [ 'Work' ] // blank node can be attached to the the loaded resource of one of these types
              },
              {
                label: 'Verksserie',
                multiple: true,
                addAnotherLabel: 'Legg til ny verksserie',
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'isPartOfWorkSeries',
                  range: 'WorkSeriesPart',
                  inputs: [
                    {
                      label: 'Serie',
                      rdfProperty: 'workSeries',
                      id: 'partOfWorkSeriesInput',
                      required: true,
                      indexTypes: [ 'workseries' ],
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'mainTitle', 'subtitle', 'partNumber' ],
                      widgetOptions: {
                        enableCreateNewResource: {
                          formRefs: [
                            {
                              formId: 'create-workseries-form',
                              targetType: 'workseries'
                            }
                          ],
                          useAfterCreation: false
                        }
                      }
                    },
                    {
                      label: 'Del',
                      rdfProperty: 'partNumber',
                      id: 'workSeriesPartNumberInput'
                    }
                  ]
                },
                subjects: [ 'Work' ] // blank node can be attached to the the loaded resource of one of these types
              },
              {
                rdfProperty: 'hasSummary',
                type: 'input-string-large'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ],
            tools: [
              {
                template: 'inverse-one-to-many-relationship',
                inverseRdfProperty: 'publicationOf',
                showRelatedButtonLabel: 'Vis utgivelser/splitte verk',
                cloneParentButtonLabel: 'Splitt verket',
                cloneParentDialogTitle: 'Splitte verk',
                cloneParentButtonTooltip: 'Lag en kopi av verket for hver utgivelse og knytt utgivelsene til de nye verkene.',
                noInverseRelationsText: 'Verket har ingen utgivelser.',
                showRelatedTitle: 'Verket har <%=relations.length%> utgivelse<%=relations.length != 1 ? "r" : ""%>:',
                showFieldsOfRelated: [
                  { field: 'mainTitle', width: '6-24', inputRef: 'workMainTitle' }, // there are 23/24th left for field layouts
                  { field: 'subtitle', width: '5-24', inputRef: 'workSubtitle' },
                  { field: 'partNumber', width: '2-24', inputRef: 'workPartNumber' },
                  { field: 'partTitle', width: '6-24', inputRef: 'workPartTitle' },
                  { field: 'recordId', width: '2-24' },
                  { field: 'publicationYear', width: '2-24', inputRef: 'workPublicationYear' }
                ],
                cloneParentButtonExplanation: `
                  Hvis du velger å splitte verket, opprettes det en ny kopi av det for hver utgivelse som er valgt over. Hver utgivelse knyttes
                  deretter til sitt nye verk som utgivelse av det verket. Før verket splittes blir du bedt om å angi hvilke verdier
                  fra utgivelsene som skal overføres til tilsvarende felt på de nye verkene.`,
                cloneParentDialogLegend: 'Velg hvilke verdier som skal kopieres fra de eksisterende utgivelsene til de nye verkene som skal opprettes:'
              }
            ],
            nextStep: {
              buttonLabel: 'Neste steg: Emneopplysninger',
              showOnlyWhenInputHasValue: 'mediaTypeInput'
            },
            deleteResource: {
              buttonLabel: 'Slett verket',
              rdfType: 'Work',
              dialogKeypath: 'deleteWorkDialog',
              dialogId: 'delete-work-dialog',
              dialogTemplateValues: {
                title: 'workMainTitle',
                creator: 'mainEntryPersonInput'
              },
              afterSuccess: {
                restart: true
              }
            }
          },
          {
            id: 'subjects',
            rdfType: 'Work',
            label: 'Emneopplysninger',
            reportLabel: 'Emner',
            inputs: [
              {
                includeOnlyWhen: { hasWorkType: [ 'Music', 'Film' ] },
                rdfProperty: 'hasCompositionType',
                multiple: true,
                addAnotherLabel: 'Legg til en komposisjonstype til',
                id: 'compositionTypeInput',
                type: 'searchable-with-result-in-side-panel',
                nameProperties: [ 'prefLabel' ],
                indexTypes: [ 'compositiontype' ],
                labelForCreateButton: 'Opprett ny komposisjonstype',
                widgetOptions: {
                  enableCreateNewResource: {
                    formRefs: [
                      {
                        formId: 'create-compositiontype-form',
                        targetType: 'compositiontype'
                      }
                    ]
                  }
                }
              },
              {
                includeOnlyWhen: { hasWorkType: 'Music' },
                rdfProperty: 'inKey',
                multiple: true
              },
              {
                includeOnlyWhen: { hasWorkType: [ 'Music', 'Film' ] },
                label: 'Besetning',
                multiple: true,
                addAnotherLabel: 'Legg til et instrument til',
                subInputs: {
                  rdfProperty: 'hasInstrumentation',
                  range: 'Instrumentation',
                  inputs: [
                    {
                      label: 'Instrument',
                      rdfProperty: 'hasInstrument',
                      id: 'instrumentInput',
                      indexTypes: [ 'instrument' ],
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'prefLabel' ],
                      widgetOptions: {
                        enableCreateNewResource: {
                          formRefs: [
                            {
                              formId: 'create-instrument-form',
                              targetType: 'instrument'
                            }
                          ]
                        }
                      }
                    },
                    {
                      label: 'Antall utøvere',
                      rdfProperty: 'hasNumberOfPerformers',
                      widgetOptions: {
                        short: true
                      }
                    }
                  ]
                },
                subjects: [ 'Work' ] // blank node can be attached to the the loaded resource of one of these types
              },
              {
                rdfProperty: 'subject',
                id: 'subjectInput',
                multiple: true,
                addAnotherLabel: 'Legg til et emne til',
                type: 'searchable-with-result-in-side-panel',
                reportFormat: {
                  separateLines: true
                },
                loadWorksAsSubjectOfItem: true,
                authority: true, // this indicates it is an authorized entity
                nameProperties: [ 'prefLabel', 'mainTitle:', 'subtitle', 'partNumber.', 'partTitle',
                  {
                    person: 'name,',
                    corporation: 'name.'
                  },
                  {
                    person: '#ordinal,',
                    event: '(ordinal).'
                  },
                  'subdivision',
                  {
                    'corporation|subject|work|place|genre|compositiontype|instrument': '(specification)',
                    person: 'specification,'
                  },
                  'placePrefLabel,',
                  'date',
                  'birthYear-', 'deathYear,',
                  'nationality.fragment.'
                ],
                previewProperties: [
                  'subtitle', 'partNumber.', 'partTitle',
                  {
                    person: '#ordinal,',
                    event: '(ordinal)'
                  },
                  'subdivision',
                  {
                    'corporation|subject|work|place|genre|compositiontype|instrument': '(specification)',
                    person: 'specification,'
                  },
                  'placePrefLabel,',
                  'date',
                  'birthYear-', 'deathYear',
                  'nationality.fragment.' ],
                indexTypes: [ 'subject', 'person', 'corporation', 'workUnstructured', 'place', 'event' ],
                widgetOptions: {
                  selectIndexTypeLegend: 'Velg emnetype',
                  enableCreateNewResource: {
                    formRefs: [ {
                      formId: 'create-subject-form',
                      targetType: 'subject' // these are matched against index types, hence lower case
                    },
                      {
                        formId: 'create-work-form',
                        targetType: 'workUnstructured'
                      },
                      {
                        formId: 'create-person-form',
                        targetType: 'person'
                      },
                      {
                        formId: 'create-corporation-form',
                        targetType: 'corporation'
                      },
                      {
                        formId: 'create-place-form',
                        targetType: 'place'
                      },
                      {
                        formId: 'create-event-form',
                        targetType: 'event'
                      } ]
                  },
                  explanations: {
                    patterns: [
                      { match: '^.*\\/subject\\/.*$', explanation: '(Generelt emne)' },
                      { match: '^.*\\/person\\/.*$', explanation: '(Person)' },
                      { match: '^.*\\/work\\/.*$', explanation: '(Verk)' },
                      { match: '^.*\\/place\\/.*$', explanation: '(Sted)' },
                      { match: '^.*\\/corporation\\/.*$', explanation: '(Organisasjon)' },
                      { match: '^.*\\/event\\/.*$', explanation: '(Hendelse)' }
                    ]
                  }
                }
              },
              {
                label: 'Klassifikasjon',
                multiple: true,
                addAnotherLabel: 'Legg til en klassifikasjon til',
                subjects: [ 'Work' ],
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'hasClassification',
                  range: 'ClassificationEntry',
                  inputs: [
                    {
                      label: 'Klassifikasjonsnummer',
                      rdfProperty: 'hasClassificationNumber',
                      required: true
                    },
                    {
                      label: 'Utgave',
                      rdfProperty: 'hasClassificationSource',
                      required: true
                    }
                  ]
                }
              },
              {
                rdfProperty: 'genre',
                id: 'genreInput',
                multiple: true,
                addAnotherLabel: 'Legg til en sjanger til',
                type: 'searchable-with-result-in-side-panel',
                authority: true,
                nameProperties: [ 'prefLabel', '(specification)' ],
                indexTypes: [ 'genre' ],
                widgetOptions: {
                  enableCreateNewResource: {
                    formRefs: [ {
                      formId: 'create-genre-form',
                      targetType: 'genre'
                    } ]
                  }
                }
              }
            ],
            nextStep: {
              showOnlyWhenInputHasValue: 'mediaTypeInput',
              buttonLabel: 'Neste steg: Beskriv deler'
            }
          },
          {
            id: 'collection-of-works',
            rdfType: 'Publication',
            label: 'Beskriv deler',
            reportLabel: 'Deler',
            inputs: [
              {
                label: 'Deler som inngår i samling',
                multiple: true,
                reportFormat: {
                  topLevel: true // this input is promoted to act on behalf of its group in the report
                },
                subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
                  rdfProperty: 'hasPublicationPart', // the rdf property of the resource
                  range: 'PublicationPart', // this is the shorthand name of the type of the blank node
                  accordionHeader: 'collection',
                  objectSortOrder: [
                    { predicate: 'partNumber', isNumber: true },
                    { predicate: 'startsAtPage' },
                    { predicate: 'mainTitle' }
                  ],
                  pagination: 10,
                  inputs: [
                    {
                      label: 'Aktør',
                      rdfProperty: 'agent',
                      indexTypes: [ 'person', 'corporation' ],
                      nameProperties: personCorpNameProperties,
                      previewProperties: [ 'birthYear-', 'deathYear', 'place', 'subdivision', 'nationality.fragment.' ],
                      type: 'searchable-with-result-in-side-panel',
                      id: 'publicationPartActorInput',
                      widgetOptions: {
                        enableCreateNewResource: {
                          formRefs: [
                            {
                              formId: 'create-person-form',
                              targetType: 'person'
                            },
                            {
                              formId: 'create-corporation-form',
                              targetType: 'corporation'
                            }
                          ],
                          useAfterCreation: false
                        },
                        whenEmptyExternalSuggestionCopyValueFrom: {
                          inputRef: 'mainEntryPersonInput'
                        }
                      }
                    },
                    {
                      label: 'Rolle',
                      rdfProperty: 'role',
                      widgetOptions: {
                        whenEmptyExternalSuggestionCopyValueFrom: {
                          inputRef: 'mainEntryRoleInput',
                          warnWhenCopyingSubset: {
                            message: 'Fyll inn verdi for Rolle også for deler som bare har forslag om Aktør fra før',
                            allowByDefault: false
                          }
                        }
                      }
                    },
                    {
                      label: 'Tittel på del',
                      rdfProperty: 'mainTitle',
                      required: true,
                      widgetOptions: {
                        enableBulkEntry: {
                          autoNumberInputRef: 'publicationPartNumberInput',
                          activationLinkLabel: 'Masseregistrering',
                          activationLinkToolTip: 'Åpne mulighet for å legge inn flere titler på én gang',
                          legend: `
                          Legg inn titler på delene her med et linjeskift mellom hver. Når du trykker på "Legg til",
                          opprettes en utgivelesedel for hver tittel. Tomme linjer blir ignorert. Hver del får også
                          knyttet til seg samme aktør og rolle hvis det er angitt over. Hvis du ikke vil ha automatisk
                          nummerering av deler som opprettes, fjerner du krysset for det valget nedenfor.
                          `,
                          rows: 10
                        }
                      }
                    },
                    {
                      label: 'Verk',
                      id: 'publicationPartWorkInput',
                      rdfProperty: 'publicationOf',
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'mainTitle', 'subtitle', 'partNumber', 'partTitle' ],
                      indexTypes: [ 'workUnstructured' ], // this is the name of the elasticsearch index type from which authorities are searched within
                      widgetOptions: {
                        enableCreateNewResource: {
                          formRefs: [ {
                            formId: 'create-work-form',
                            targetType: 'workUnstructured' // these are matched against index types, hence lower case
                          } ]
                        }
                      }
                    },
                    {
                      label: 'Del',
                      rdfProperty: 'partNumber',
                      id: 'publicationPartNumberInput'
                    },
                    // the following pair of properties is a range, which will be placed on the same line, with the label of the first one only.
                    {
                      includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'SheetMusic', 'ComicBook' ] },
                      label: 'Sidetall',
                      id: 'startsAtPageInput',
                      rdfProperty: 'startsAtPage',
                      widgetOptions: {
                        isRangeStart: true,
                        reportLabel: 'Sidetall fra'
                      }
                    },
                    {
                      includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'SheetMusic', 'ComicBook' ] },
                      rdfProperty: 'endsAtPage',
                      widgetOptions: {
                        isRangeEnd: true,
                        reportLabel: 'Sidetall til'
                      }
                    }
                  ]
                },
                addAnotherLabel: 'Legg til en del til',
                subjects: [ 'Publication' ]
              }
            ],
            nextStep: {
              buttonLabel: 'Neste steg: Biinnførsler',
              showOnlyWhenInputHasValue: 'mediaTypeInput'
            }
          },
          {
            // additional entries, such as translator, illustrator, composer etc
            id: 'confirm-addedentry',
            rdfType: 'Work',
            label: 'Biinnførsler',
            inputs: [
              {
                label: 'Biinnførsel',
                multiple: true, // can have many of these
                addAnotherLabel: 'Legg til ny biinnførsel',
                reportFormat: {
                  list: true
                },
                subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
                  rdfProperty: 'contributor', // the rdf property of the resource
                  range: 'Contribution', // this is the shorthand name of the type of the blank node
                  inputs: [ // these are the actual sub inputs
                    {
                      label: 'Aktør',
                      required: true,
                      rdfProperty: 'agent',
                      id: 'contributionAgentInput',
                      indexTypes: [ 'person', 'corporation' ],
                      nameProperties: personCorpNameProperties,
                      previewProperties: [ 'specification', 'birthYear-', 'deathYear', 'nationality.fragment.' ],
                      type: 'searchable-with-result-in-side-panel',
                      widgetOptions: {
                        showSelectItem: false, // show and enable select work radio button
                        enableCreateNewResource: {
                          formRefs: [
                            {
                              formId: 'create-person-form',
                              targetType: 'person'
                            },
                            {
                              formId: 'create-corporation-form',
                              targetType: 'corporation'
                            }
                          ],
                          useAfterCreation: false
                        }
                      }
                    },
                    {
                      label: 'Rolle',
                      required: true,
                      rdfProperty: 'role'
                    }
                  ]
                },
                subjects: [ 'Work', 'Publication' ], // blank node can be attached to the the loaded resource of one of these types
                cssClassPrefix: 'additional-entries' // prefix of class names to identify a span surrounding this input or group of sub inputs.
                // actual names are <prefix>-non-editable and <prefix>-editable to enable alternative presentation when not editable
              }
            ],
            nextStep: {
              buttonLabel: 'Avslutt registrering av utgivelsen',
              showOnlyWhenInputHasValue: 'mediaTypeInput',
              restart: true
            }
          }
        ],
        authorityMaintenance: [
          {
            inputs: [
              maintenanceInputs('Personer', 'person'),
              maintenanceInputs('Organisasjoner', 'corporation'),
              maintenanceInputs('Emner', 'subject'),
              maintenanceInputs('Steder', 'place'),
              maintenanceInputs('Hendelser', 'event'),
              maintenanceInputs('Sjangre', 'genre'),
              maintenanceInputs('Forlagsserier', 'serial'),
              maintenanceInputs('Verksserier', 'workseries'),
              maintenanceInputs('Musikkinstrumenter', 'instrument'),
              maintenanceInputs('Komposisjonstyper', 'compositiontype'),
              {
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchMainResource: {
                  label: 'Utgivelser',
                  indexType: 'publication'
                },
                widgetOptions: {
                  maintenance: true,
                  editWithTemplate: {
                    template: 'workflow',
                    descriptionKey: 'maintPub'
                  }
                }
              },
              {
                searchMainResource: {
                  label: 'Verk',
                  indexType: 'workUnstructured'
                },
                widgetOptions: {
                  maintenance: true,
                  editWithTemplate: {
                    template: 'workflow',
                    descriptionKey: 'maintWork'
                  },
                  editSubItemWithTemplate: 'workflow'
                }
              }
            ]
          }
        ],
        search: {
          person: {
            type: 'person',
            sortedListQueryForField: 'name',
            selectIndexLabel: 'Person',
            resultItemLabelProperties: [ 'name,', '#ordinal,', 'specification,', 'birthYear-', 'deathYear,', 'nationality.fragment.' ],
//          resultItemDetailsLabelProperties: [ 'lifeSpan', 'nationality' ],
            itemHandler: 'personItemHandler',
            subItemsExpandTooltip: 'Vis/skjul verk',
            scrollToMiddleOfResultSet: true
          },
          subject: {
            type: 'subject',
            sortedListQueryForField: 'prefLabel',
            selectIndexLabel: 'Generelt',
            resultItemLabelProperties: [ 'prefLabel', '(specification)' ],
            scrollToMiddleOfResultSet: true
          },
          work: {
            type: 'work',
            structuredQuery: true,
            selectIndexLabel: 'Verk',
            resultItemLabelProperties: [ 'mainTitle', ':subtitle' ],
            resultItemLabelProperties2: [ 'partNumber.', 'partTitle' ],
            resultItemDetailsLabelProperties: [ 'workTypeLabel,', 'publicationYear,', 'creator' ],
            linkFromUri: {
              regExp: '^http:\\/\\/data\\.deichman\\.no\\/work\\/(w[a-f0-9]+)$',
              replacement: 'http://sok.deichman.no/work/$1',
              toolTip: 'Vis verket på publikumssiden'
            },
            itemHandler: 'workItemHandler'
          },
          workUnstructured: {
            type: 'work',
            selectIndexLabel: 'Verk',
            legend: 'Søk etter tittel, hovedinnførsel eller verksuri',
            resultItemLabelProperties: [ 'mainTitle', ':subtitle' ],
            resultItemLabelProperties2: [ 'partNumber.', 'partTitle' ],
            resultItemDetailsLabelProperties: [ 'workTypeLabel,', 'publicationYear,', 'creator' ],
            linkFromUri: {
              regExp: '^http:\\/\\/data\\.deichman\\.no\\/work\\/(w[a-f0-9]+)$',
              replacement: 'http://sok.deichman.no/work/$1',
              toolTip: 'Vis verket på publikumssiden'
            },
            itemHandler: 'workItemHandler',
            subItemsExpandTooltip: 'Vis/skjul utgivelser'
          },
          genre: {
            type: 'genre',
            selectIndexLabel: 'Sjanger',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', '(specification)' ],
            scrollToMiddleOfResultSet: true
          },
          corporation: {
            type: 'corporation',
            selectIndexLabel: 'Organisasjon',
            sortedListQueryForField: 'name',
            resultItemLabelProperties: [ 'name.', 'subdivision', '(specification)', 'placePrefLabel' ],
//          resultItemDetailsLabelProperties: [ 'inParens:specification' ]
            scrollToMiddleOfResultSet: true
          },
          place: {
            type: 'place',
            selectIndexLabel: 'Sted',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', '(specification)' ],
            resultItemDetailsLabelProperties: [ 'alternativeName' ],
            scrollToMiddleOfResultSet: true
          },
          event: {
            type: 'event',
            selectIndexLabel: 'Hendelse',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', '(ordinal).', 'placePrefLabel,', 'date' ], // prefLabel (ordinal). place, date
//          resultItemDetailsLabelProperties: [ 'placePrefLabel', 'inParens:placeAlternativeName', 'specification' ]
            scrollToMiddleOfResultSet: true
          },
          serial: {
            type: 'serial',
            selectIndexLabel: 'Serie',
            sortedListQueryForField: 'serialMainTitle',
            resultItemLabelProperties: [ 'serialMainTitle:', 'subtitle' ],
            resultItemDetailsLabelProperties: [ 'partNumber.', 'partTitle', 'issn' ],
            scrollToMiddleOfResultSet: true
          },
          publication: {
            type: 'publication',
            selectIndexLabel: 'Utgivelse',
            legend: 'Søk etter tittel eller tittelnummer',
            resultItemLabelProperties: [ 'creator', 'mainTitle', 'subtitle', 'publicationYear', 'recordIdPrefixed' ],
            itemHandler: 'publicationItemHandler'
          },
          instrument: {
            type: 'instrument',
            selectIndexLabel: 'Instrument',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', 'inParens:specification' ],
            scrollToMiddleOfResultSet: true
          },
          compositiontype: {
            type: 'compositionType',
            selectIndexLabel: 'Komposisjonstype',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', 'inParens:specification' ],
            scrollToMiddleOfResultSet: true
          },
          workseries: {
            type: 'workSeries',
            selectIndexLabel: 'Verksserie',
            sortedListQueryForField: 'workSeriesMainTitle',
            resultItemLabelProperties: [ 'workSeriesMainTitle:', 'subtitle' ],
            resultItemDetailsLabelProperties: [ 'partNumber.', 'partTitle' ],
            scrollToMiddleOfResultSet: true
          }
        },
        relationTargetLabels: {
          Work: [ 'mainTitle', ':subtitle', 'partNumber.', 'partTitle', 'publicationYear,' ],
          Publication: [ 'mainTitle', ':subtitle', 'partNumber.', 'partTitle', 'publicationYear,' ],
          PublicationPart: [ 'mainTitle' ]
        },
        typeMap: {
          // this map contains a map of all known independent resource types (i.e. not blank node types) as they appear in
          // resource urls and their canonical names
          work: 'Work',
          person: 'Person',
          publication: 'Publication',
          genre: 'Genre',
          subject: 'Subject',
          place: 'Place',
          event: 'Event',
          serial: 'Serial',
          corporation: 'Corporation',
          instrument: 'Instrument',
          compositionType: 'CompositionType',
          workSeries: 'WorkSeries'
        },
        rdfTypeToIndexType: {
          'Work': 'work'
        },
        resourceTypeAliases: {
          'compositiontype': 'compositionType',
          'workseries': 'workSeries'
        },
        prefillValuesFromExternalSources: [
          { resourceType: 'Work', demandTopBanana: true },
          { resourceType: 'Publication' },
          {
            resourceType: 'Person',
            wrappedIn: 'Contribution',
            predicate: 'agent',
            enableCreateNewResource: true
          },
          {
            resourceType: 'Person',
            wrappedIn: 'PublicationPart',
            predicate: 'agent',
            enableCreateNewResource: true
          },
          {
            resourceType: 'Serial',
            wrappedIn: 'SerialIssue',
            predicate: 'serial',
            enableCreateNewResmource: true
          },
          {
            resourceType: 'Person',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableCreateNewResource: true
          },
          {
            resourceType: 'Place',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableCreateNewResource: true
          },
          {
            resourceType: 'Event',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableCreateNewResource: true
          },
          {
            resourceType: 'Work',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableCreateNewResource: true
          },
          {
            resourceType: 'Subject',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableCreateNewResource: true
          },
          {
            resourceType: '/Work',
            wrappedIn: 'PublicationPart',
            predicate: 'publicationOf',
            enableCreateNewResource: true
          }
        ],
        taskDescriptions: {
          filmPub: 'Katalogisering av filmutgivelse',
          comicPub: 'Katalogisering av tegneserieutgivelse',
          aBookPub: 'Katalogisering av lydbokutgivelse',
          eBookPub: 'Katalogisering av e-bokutgivelse',
          bookPub: 'Katalogisering av bokutgivelse',
          langCourse: 'Katalogisering av språkkurs',
          gamePub: 'Katalogisering av spill',
          sheetMusPub: 'Katalogisering av musikknoter',
          musRecPub: 'Katalogisering av musikkopptak',
          maintWork: 'Vedlikeholde verk',
          maintPub: 'Vedlikeholde utgivelse',
          editPerson: 'Utvidet redigering av personautoritet',
          editCorporation: 'Utvidet redigering av organisasjonsautoritet',
          editSubject: 'Utvidet redigering av emneautoritet',
          editPlace: 'Utvidet redigering av stedsautoritet',
          editSerial: 'Utvidet redigering av forlagsserie',
          editWorkSeries: 'Utvidet redigering av verksserie',
          editInstrument: 'Utvidet redigering av instrumentautoritet',
          editCompositionType: 'Utvidet redigering av komposjonstype',
          comparePerson: 'Sammenlikne og slå sammen personautoritet',
          compareCorporation: 'Sammenlikne og slå sammen organisasjonsautoritet',
          compareSubject: 'Sammenlikne og slå sammen emneautoritet',
          comparePlace: 'Sammenlikne og slå sammen stedsautoritet',
          compareSerial: 'Sammenlikne og slå sammen forlagsserie',
          compareWorkSeries: 'Sammenlikne og slå sammen verksserie',
          compareInstrument: 'Sammenlikne og slå sammen instrumentautoritet',
          compareCompositionType: 'Sammenlikne og slå sammen komposjonstype',
          compareWork: 'Sammenlikne og slå sammen verk',
        },
        translations: {
          Work: {
            indet: 'verk',
            det: 'verket',
          },
          Publication: {
            indet: 'utgivelse',
            det: 'utgivelsen'
          },
          PublicationPart: {
            indet: 'utgivelsesdel',
            det: 'utgivelsendelen'
          },
          Person: {
            indet: 'person',
            det: 'personen'
          },
          Corporation: {
            indet: 'korporasjon',
            det: 'korporasjonen'
          },
          Subject: {
            indet: 'emne',
            det: 'emnet'
          },
          Place: {
            indet: 'sted',
            det: 'stedet'
          },
          Serial: {
            indet: 'forlagsserie',
            det: 'forlagsserien'
          },
          WorkSeries: {
            indet: 'verksserie',
            det: 'verksserien'
          },
          Genre: {
            indet: 'sjanger',
            det: 'sjangeren'
          },
          Event: {
            indet: 'hendelse',
            det: 'hendelsen'
          }
        },
        abbreviations: {
          'Del nummer': 'Delnr.',
          'Utgivelsesår': 'Utg.år'
        }
      }
    response.json(config)
  })
}
