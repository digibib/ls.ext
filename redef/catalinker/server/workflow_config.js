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
            labelForCreateButton: 'createNewPersonLabel',
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
            labelForCreateButton: 'createNewSubjectLabel',
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
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-genre-form',
            labelForCreateButton: 'createNewGenreLabel',
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
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-corporation-form',
            labelForCreateButton: 'createNewCorporationLabel',
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
                rdfProperty: 'place',
                type: 'searchable-authority-dropdown',
                indexTypes: 'place',
                indexDocumentFields: [ 'prefLabel' ]
              },
              {
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
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
            labelForCreateButton: 'createNewWorkLabel',
            rdfType: 'Work',
            inputs: [
              {
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                type: 'input-string',
                rdfProperty: 'subtitle'
              },
              {
                type: 'input-string',
                rdfProperty: 'partNumber'
              },
              {
                type: 'input-string',
                rdfProperty: 'partTitle'
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
            labelForCreateButton: 'createNewWorkLabel',
            rdfType: 'Work',
            inputs: [
              {
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'subtitle'
              },
              {
                type: 'input-string',
                rdfProperty: 'partTitle'
              },
              {
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
            labelForCreateButton: 'createNewWorkSeriesLabel',
            rdfType: 'WorkSeries',
            inputs: [
              {
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'subtitle'
              },
              {
                label: 'seriesPartNumber',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'partNumber'
              },
              {
                label: 'subSeriesTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'partTitle'
              }
            ]
          },
          {
            id: 'create-place-form',
            labelForCreateButton: 'createNewPlaceLabel',
            rdfType: 'Place',
            inputs: [
              {
                label: 'nameLabel',
                rdfProperty: 'prefLabel',
                displayValueSource: true,
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true // value of this field should be copied from the search field above
              },
              {
                rdfProperty: 'specification',
                type: 'input-string'
                // input type must be defined explicitly, otherwise it will inherit from the search field above
              },
              {
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-event-form',
            labelForCreateButton: 'createNewEventLabel',
            rdfType: 'Event',
            inputs: [
              {
                label: 'nameLabel',
                rdfProperty: 'prefLabel',
                displayValueSource: true,
                type: 'input-string',
                preFillFromSearchField: true // value of this field should be copied from the search field above
              },
              {
                rdfProperty: 'place',
                type: 'searchable-authority-dropdown',
                indexTypes: 'place',
                indexDocumentFields: [ 'prefLabel' ]
              },
              {
                rdfProperty: 'ordinal',
                type: 'input-string'
              },
              {
                rdfProperty: 'date',
                type: 'input-string'
              },
              {
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-serial-form',
            labelForCreateButton: 'createNewSeriesLabel',
            rdfType: 'Serial',
            inputs: [
              {
                label: 'seriesTitleLabel',
                rdfProperty: 'mainTitle',
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                preFillFromSearchField: true, // value of this field should be copied from the search field above
                displayValueSource: true // after creation, send actual value in this field back to where the search started
              },
              {
                type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
                rdfProperty: 'subtitle'
              },
              {
                label: 'seriesPartNumber',
                type: 'input-string',
                rdfProperty: 'partNumber'
              },
              {
                label: 'subSeriesTitle',
                type: 'input-string',
                rdfProperty: 'partTitle'
              },
              {
                type: 'input-string',
                rdfProperty: 'issn'
              },
              {
                label: 'publisherLabel',
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
            labelForCreateButton: 'createNewInstrumentLabel',
            rdfType: 'Instrument',
            inputs: [
              {
                label: 'nameLabel',
                rdfProperty: 'prefLabel',
                type: 'input-string',
                preFillFromSearchField: true
              },
              {
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
                rdfProperty: 'alternativeName',
                type: 'input-string'
              },
              createdTimestamp(),
              modifiedTimestamp()
            ]
          },
          {
            id: 'create-compositiontype-form',
            labelForCreateButton: 'createNewCompositionTypeLabel',
            rdfType: 'CompositionType',
            inputs: [
              {
                label: 'nameLabel',
                rdfProperty: 'prefLabel',
                type: 'input-string',
                preFillFromSearchField: true
              },
              {
                rdfProperty: 'specification',
                type: 'input-string'
              },
              {
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
            label: 'mainEntryLabel',
            inputs: [
              {
                id: 'isbnInput',
                includeOnlyWhen: {
                  hasMediaType: [ 'Book', 'Audiobook', 'SheetMusic', 'ComicBook', 'LanguageCourse', 'E-book' ]
                },
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchForValueSuggestions: {
                  label: 'ISBNLabel',
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
                    legendSingular: 'alreadyRegisteredISBNSingular',
                    legendPlural: 'alreadyRegisteredISBNPlural',
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
                  label: 'EANLabel',
                  pattern: '[0-9]{12,14}',
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
                label: 'missingMainEntryLabel',
                id: 'missingMainEntry',
                rdfProperty: 'missingMainEntry'
              },
              {
                label: 'mainContributorLabel',
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
                      label: 'agentLabel',
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
                        enableEditResource: {
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
                        enableInPlaceEditing: true
                      },
                      headlinePart: {
                        order: 10
                      }
                    },
                    {
                      id: 'mainEntryRoleInput',
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
                label: 'improperWorkLabel',
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
                  label: 'searchWorkAsMainResourceLabel',
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
                  enableEditResource: {
                    formRefs: [ {
                      formId: 'create-main-work-form',
                      targetType: 'work'
                    } ],
                    useAfterCreation: {
                      excludeInputRefs: [ 'mainEntryPersonInput', 'mainEntryRoleInput' ]
                    }
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
              buttonLabel: 'nextStepDescription',
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
            label: 'publicationTabLabel',
            reportLabel: 'publicationLabel',
            inputs: [
              { rdfProperty: 'hasPrimaryCataloguingSource', initiallyHidden: true },
              { rdfProperty: 'hasIdentifierInPrimaryCataloguingSource', initiallyHidden: true },
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
              { rdfProperty: 'partNumber' },
              {
                rdfProperty: 'partTitle',
                headlinePart: {
                  order: 40,
                  styleClass: 'title'
                }
              },
              {
                rdfProperty: 'variantTitle',
                multiple: true,
                addAnotherLabel: 'addAnotherVariantTitle',
              },
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
                addAnotherLabel: 'addAnotherPageNumber'
              },
              {
                rdfProperty: 'hasExtent',
                addAnotherLabel: 'addAnotherExtent'
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
                addAnotherLabel: 'addAnotherISBN'
              },
              {
                includeOnlyWhen: { hasMediaType: [ 'Other', 'SheetMusic' ] },
                rdfProperty: 'hasIsmn',
                multiple: true,
                addAnotherLabel: 'addAnotherISMN'
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
                  selectIndexTypeLegend: 'selectActorType',
                  enableEditResource: {
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
                  },
                  enableInPlaceEditing: true
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
                  enableEditResource: {
                    formRefs: [ {
                      formId: 'create-place-form',
                      targetType: 'place'
                    } ]
                  },
                  enableInPlaceEditing: true
                }
              },
              {
                label: 'seriesLabel',
                multiple: true,
                addAnotherLabel: 'addAnotherSeries',
                subjects: [ 'Publication' ],
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'inSerial',
                  range: 'SerialIssue',
                  inputs: [
                    {
                      required: true,
                      rdfProperty: 'serial',
                      id: 'serialInput',
                      indexTypes: 'serial',
                      nameProperties: [ 'mainTitle', 'subtitle' ],
                      type: 'searchable-with-result-in-side-panel',
                      widgetOptions: {
                        showSelectItem: false, // show and enable select work radio button
                        enableEditResource: {
                          formRefs: [ {
                            formId: 'create-serial-form',
                            targetType: 'serial'
                          } ],
                          useAfterCreation: false
                        },
                        enableInPlaceEditing: true
                      }
                    },
                    {
                      label: 'issueNumberLabel',
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
                  enableEditResource: {
                    formRefs: [ {
                      formId: 'create-work-form',
                      targetType: 'work'
                    } ],
                    useAfterCreation: true
                  }
                }
              },
              createdTimestamp(),
              modifiedTimestamp()
            ],
            nextStep: {
              buttonLabel: 'nextStepDescribeWork',
              showOnlyWhenInputHasValue: 'mediaTypeInput'
            },
            deleteResource: {
              buttonLabel: 'deletePublication',
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
              buttonLabel: 'changeWorkOfPublication',
              confirmLabel: 'confirmChangeWorkOfPublication'
            }
          },
          {
            id: 'describe-work',
            rdfType: 'Work',
            label: 'workTabLabel',
            reportLabel: 'workLabel',
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
                rdfProperty: 'partNumber',
                id: 'workPartNumber'
              },
              {
                rdfProperty: 'partTitle',
                id: 'workPartTitle'
              },
              {
                rdfProperty: 'publicationYear',
                label: 'publicationYearLabel',
                id: 'workPublicationYear'
              },
              {
                rdfProperty: 'nationality',
                label: 'originCountryLabel',
                multiple: 'true'
              },
              { rdfProperty: 'language', multiple: true },
              {
                rdfProperty: 'hasWorkType',
                type: 'select-predefined-value',
                hiddenUrlQueryValue: true,
                id: 'workTypeInput',
                widgetOptions: {
                  queryParameter: 'hasWorkType',
                  prefix: 'http://data.deichman.no/workType#',
                  conditionalInputType: [
                    {
                      when: 'inWorkflow',
                      replaceType: 'readonly-hidden-url-query-value'
                    },
                    {
                      when: 'editingAuthority',
                      replaceType: 'select-predefined-value'
                    }
                  ]
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
                label: 'workRelationLabel',
                multiple: true,
                addAnotherLabel: 'addAnotherRelation',
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'isRelatedTo',
                  range: 'WorkRelation',
                  inputs: [
                    {
                      label: 'workSeriesWorkLabel',
                      rdfProperty: 'work',
                      id: 'relatedToWorkInput',
                      required: true,
                      indexTypes: [ 'workUnstructured' ],
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'mainTitle', 'subtitle', 'partNumber', 'partTitle' ],
                      widgetOptions: {
                        enableEditResource: {
                          formRefs: [
                            {
                              formId: 'create-work-form',
                              targetType: 'workUnstructured'
                            }
                          ],
                          useAfterCreation: false
                        },
                        enableInPlaceEditing: true
                      }
                    },
                    {
                      label: 'relationTypeLabel',
                      rdfProperty: 'hasRelationType',
                      required: true,
                      id: 'relationTypeInput'
                    },
                    {
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
                label: 'workSeriesLabel',
                multiple: true,
                addAnotherLabel: 'addAnotherWorkSeries',
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'isPartOfWorkSeries',
                  range: 'WorkSeriesPart',
                  inputs: [
                    {
                      rdfProperty: 'workSeries',
                      label: 'seriesLabel',
                      id: 'partOfWorkSeriesInput',
                      required: true,
                      indexTypes: [ 'workseries' ],
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'mainTitle', 'subtitle', 'partNumber' ],
                      widgetOptions: {
                        enableEditResource: {
                          formRefs: [
                            {
                              formId: 'create-workseries-form',
                              targetType: 'workseries'
                            }
                          ],
                          useAfterCreation: false
                        },
                        enableInPlaceEditing: true
                      }
                    },
                    {
                      label: 'part',
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
                showRelatedButtonLabel: 'showPublicationsAndSplitWork',
                cloneParentButtonLabel: 'splitTheWork',
                cloneParentDialogTitle: 'splitWork',
                cloneParentButtonTooltip: 'makeWorkCopyForEachPubliation',
                noInverseRelationsText: 'workHasNoPublications',
                showRelatedTitle: 'workHasNumberOfPublications',
                showFieldsOfRelated: [
                  { field: 'mainTitle', width: '6-24', inputRef: 'workMainTitle' }, // there are 23/24th left for field layouts
                  { field: 'subtitle', width: '5-24', inputRef: 'workSubtitle' },
                  { field: 'partNumber', width: '2-24', inputRef: 'workPartNumber' },
                  { field: 'partTitle', width: '5-24', inputRef: 'workPartTitle' },
                  { field: 'recordId', width: '3-24' },
                  { field: 'publicationYear', width: '2-24', inputRef: 'workPublicationYear' }
                ],
                cloneParentButtonExplanation: 'splitWorkLegend',
                cloneParentDialogLegend: 'splitWorkDialogLegend'
              }
            ],
            nextStep: {
              buttonLabel: 'nextStepSubjects',
              showOnlyWhenInputHasValue: 'mediaTypeInput'
            },
            deleteResource: {
              buttonLabel: 'deleteWork',
              preventDeleteIfReferred: true,
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
            label: 'subjectsTabLabel',
            reportLabel: 'maintGeneralSubjectLabelPlur',
            inputs: [
              {
                includeOnlyWhen: { hasWorkType: [ 'Music', 'Film' ] },
                rdfProperty: 'hasCompositionType',
                multiple: true,
                addAnotherLabel: 'addAnotherCompositionType',
                id: 'compositionTypeInput',
                type: 'searchable-with-result-in-side-panel',
                nameProperties: [ 'prefLabel' ],
                indexTypes: [ 'compositiontype' ],
                labelForCreateButton: 'createNewCompositionType',
                widgetOptions: {
                  enableEditResource: {
                    formRefs: [
                      {
                        formId: 'create-compositiontype-form',
                        targetType: 'compositiontype'
                      }
                    ]
                  },
                  enableInPlaceEditing: true
                }
              },
              {
                includeOnlyWhen: { hasWorkType: 'Music' },
                rdfProperty: 'inKey',
                multiple: true
              },
              {
                includeOnlyWhen: { hasWorkType: [ 'Music', 'Film' ] },
                label: 'instrumentationLabel',
                multiple: true,
                addAnotherLabel: 'addAnotherInstrument',
                subInputs: {
                  rdfProperty: 'hasInstrumentation',
                  range: 'Instrumentation',
                  inputs: [
                    {
                      rdfProperty: 'hasInstrument',
                      id: 'instrumentInput',
                      indexTypes: [ 'instrument' ],
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'prefLabel' ],
                      required: true,
                      widgetOptions: {
                        enableEditResource: {
                          formRefs: [
                            {
                              formId: 'create-instrument-form',
                              targetType: 'instrument'
                            }
                          ]
                        },
                        enableInPlaceEditing: true
                      }
                    },
                    {
                      label: 'numberOfPerformersLabel',
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
                addAnotherLabel: 'addAnotherSubject',
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
                  selectIndexTypeLegend: 'selectSubjectType',
                  enableEditResource: {
                    formRefs: [
                      {
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
                      }
                    ]
                  },
                  enableInPlaceEditing: true,
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
                label: 'classificationLabel',
                multiple: true,
                addAnotherLabel: 'addAnotherClassification',
                subjects: [ 'Work' ],
                reportFormat: {
                  list: true
                },
                subInputs: {
                  rdfProperty: 'hasClassification',
                  range: 'ClassificationEntry',
                  inputs: [
                    {
                      rdfProperty: 'hasClassificationNumber',
                      required: true
                    },
                    {
                      label: 'classificationSourceLabel',
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
                addAnotherLabel: 'addAnotherGenre',
                type: 'searchable-with-result-in-side-panel',
                authority: true,
                nameProperties: [ 'prefLabel', '(specification)' ],
                indexTypes: [ 'genre' ],
                widgetOptions: {
                  enableEditResource: {
                    formRefs: [ {
                      formId: 'create-genre-form',
                      targetType: 'genre'
                    } ]
                  },
                  enableInPlaceEditing: true
                }
              }
            ],
            nextStep: {
              showOnlyWhenInputHasValue: 'mediaTypeInput',
              buttonLabel: 'nextStepDescribeParts'
            }
          },
          {
            id: 'collection-of-works',
            rdfType: 'Publication',
            label: 'publicationPartsTabLabel',
            reportLabel: 'partsLabel',
            inputs: [
              {
                label: 'publicationPartsLabel',
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
                      label: 'agentLabel',
                      rdfProperty: 'agent',
                      indexTypes: [ 'person', 'corporation' ],
                      nameProperties: personCorpNameProperties,
                      previewProperties: [ 'birthYear-', 'deathYear', 'place', 'subdivision', 'nationality.fragment.' ],
                      type: 'searchable-with-result-in-side-panel',
                      id: 'publicationPartActorInput',
                      widgetOptions: {
                        enableEditResource: {
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
                        enableInPlaceEditing: true,
                        whenEmptyExternalSuggestionCopyValueFrom: {
                          inputRef: 'mainEntryPersonInput'
                        }
                      }
                    },
                    {
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
                      label: 'pubPartMainTitleLabel',
                      rdfProperty: 'mainTitle',
                      required: true,
                      widgetOptions: {
                        enableBulkEntry: {
                          autoNumberInputRef: 'publicationPartNumberInput',
                          rows: 10
                        }
                      }
                    },
                    {
                      label: 'workLabel',
                      id: 'publicationPartWorkInput',
                      rdfProperty: 'publicationOf',
                      type: 'searchable-with-result-in-side-panel',
                      nameProperties: [ 'mainTitle', 'subtitle', 'partNumber', 'partTitle' ],
                      indexTypes: [ 'workUnstructured' ], // this is the name of the elasticsearch index type from which authorities are searched within
                      widgetOptions: {
                        enableEditResource: {
                          formRefs: [ {
                            formId: 'create-work-form',
                            targetType: 'workUnstructured' // these are matched against index types, hence lower case
                          } ]
                        },
                        enableInPlaceEditing: true
                      }
                    },
                    {
                      label: 'part',
                      rdfProperty: 'partNumber',
                      id: 'publicationPartNumberInput'
                    },
                    // the following pair of properties is a range, which will be placed on the same line, with the label of the first one only.
                    {
                      includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'SheetMusic', 'ComicBook' ] },
                      label: 'pageNumbers',
                      id: 'startsAtPageInput',
                      rdfProperty: 'startsAtPage',
                      widgetOptions: {
                        isRangeStart: true,
                        reportLabel: 'Sidetall fra'
                      }
                    },
                    {
                      includeOnlyWhen: { hasMediaType: [ 'Other', 'Book', 'SheetMusic', 'ComicBook' ] },
                      label: 'emptyLabel',
                      rdfProperty: 'endsAtPage',
                      widgetOptions: {
                        isRangeEnd: true,
                        reportLabel: 'Sidetall til'
                      }
                    }
                  ]
                },
                addAnotherLabel: 'addAnotherPart',
                subjects: [ 'Publication' ]
              }
            ],
            nextStep: {
              buttonLabel: 'nextStepAdditionalEntries',
              showOnlyWhenInputHasValue: 'mediaTypeInput'
            }
          },
          {
            // additional entries, such as translator, illustrator, composer etc
            id: 'confirm-addedentry',
            rdfType: 'Work',
            label: 'additionalEntriesTabLabel',
            inputs: [
              {
                label: 'additionalEntryLabel',
                multiple: true, // can have many of these
                addAnotherLabel: 'addAnotherAdditionalEntry',
                reportFormat: {
                  list: true
                },
                subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
                  rdfProperty: 'contributor', // the rdf property of the resource
                  range: 'Contribution', // this is the shorthand name of the type of the blank node
                  inputs: [ // these are the actual sub inputs
                    {
                      required: true,
                      label: 'agentLabel',
                      rdfProperty: 'agent',
                      id: 'contributionAgentInput',
                      indexTypes: [ 'person', 'corporation' ],
                      nameProperties: personCorpNameProperties,
                      previewProperties: [ 'specification', 'birthYear-', 'deathYear', 'nationality.fragment.' ],
                      type: 'searchable-with-result-in-side-panel',
                      widgetOptions: {
                        showSelectItem: false, // show and enable select work radio button
                        enableEditResource: {
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
                        enableInPlaceEditing: true
                      }
                    },
                    {
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
              buttonLabel: 'finishRegisterPublication',
              showOnlyWhenInputHasValue: 'mediaTypeInput',
              restart: true
            }
          }
        ],
        authorityMaintenance: [
          {
            inputs: [
              maintenanceInputs('maintPersonLabelPlur', 'person'),
              maintenanceInputs('maintCorporationLabelPlur', 'corporation'),
              maintenanceInputs('maintGeneralSubjectLabelPlur', 'subject'),
              maintenanceInputs('maintPlaceLabelPlur', 'place'),
              maintenanceInputs('maintEventLabelPlur', 'event'),
              maintenanceInputs('maintGenreLabelPlur', 'genre'),
              maintenanceInputs('maintSerialLabelPlur', 'serial'),
              maintenanceInputs('maintWorkSeriesLabelPlur', 'workseries'),
              maintenanceInputs('maintInstrumentLabelPlur', 'instrument'),
              maintenanceInputs('maintCompositionTypeLabelPlur', 'compositiontype'),
              {
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchMainResource: {
                  label: 'maintPublicationLabelPlur',
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
                  label: 'maintWorkLabelPlur',
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
            selectIndexLabel: 'personLabel',
            resultItemLabelProperties: [ 'name,', '#ordinal,', 'specification,', 'birthYear-', 'deathYear,', 'nationality.fragment.' ],
//          resultItemDetailsLabelProperties: [ 'lifeSpan', 'nationality' ],
            itemHandler: 'personItemHandler',
            subItemsExpandTooltip: 'Vis/skjul verk',
            scrollToMiddleOfResultSet: true
          },
          subject: {
            type: 'subject',
            sortedListQueryForField: 'prefLabel',
            selectIndexLabel: 'generalSubjectLabel',
            resultItemLabelProperties: [ 'prefLabel', '(specification)' ],
            scrollToMiddleOfResultSet: true
          },
          work: {
            type: 'work',
            structuredQuery: true,
            selectIndexLabel: 'workLabel',
            resultItemLabelProperties: [ 'creator', 'mainTitle:', 'subtitle.', 'partNumber.', 'partTitle.' ],
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
            selectIndexLabel: 'workLabel',
            legend: 'searchWorkLegend',
            resultItemLabelProperties: [ 'creator', 'mainTitle:', 'subtitle.', 'partNumber.', 'partTitle.' ],
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
            selectIndexLabel: 'genreLabel',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', '(specification)' ],
            scrollToMiddleOfResultSet: true
          },
          corporation: {
            type: 'corporation',
            selectIndexLabel: 'corporationLabel',
            sortedListQueryForField: 'name',
            resultItemLabelProperties: [ 'name.', 'subdivision', '(specification)', 'placePrefLabel' ],
//          resultItemDetailsLabelProperties: [ 'inParens:specification' ]
            scrollToMiddleOfResultSet: true
          },
          place: {
            type: 'place',
            selectIndexLabel: 'placeLabel',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', '(specification)' ],
            resultItemDetailsLabelProperties: [ 'alternativeName' ],
            scrollToMiddleOfResultSet: true
          },
          event: {
            type: 'event',
            selectIndexLabel: 'eventLabel',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', '(ordinal).', 'placePrefLabel,', 'date' ], // prefLabel (ordinal). place, date
//          resultItemDetailsLabelProperties: [ 'placePrefLabel', 'inParens:placeAlternativeName', 'specification' ]
            scrollToMiddleOfResultSet: true
          },
          serial: {
            type: 'serial',
            selectIndexLabel: 'serialLabel',
            sortedListQueryForField: 'serialMainTitle',
            resultItemLabelProperties: [ 'serialMainTitle:', 'subtitle' ],
            resultItemDetailsLabelProperties: [ 'partNumber.', 'partTitle', 'issn' ],
            scrollToMiddleOfResultSet: true
          },
          publication: {
            type: 'publication',
            selectIndexLabel: 'publication',
            legend: 'searchPublicationLegend',
            resultItemLabelProperties: [ 'creator', 'mainTitle:', 'subtitle.', 'partNumber.', 'partTitle.' ,'publicationYear', 'recordIdPrefixed' ],
            itemHandler: 'publicationItemHandler'
          },
          instrument: {
            type: 'instrument',
            selectIndexLabel: 'instrumentLabel',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', 'inParens:specification' ],
            scrollToMiddleOfResultSet: true
          },
          compositiontype: {
            type: 'compositionType',
            selectIndexLabel: 'compositionTypeLabel',
            sortedListQueryForField: 'prefLabel',
            resultItemLabelProperties: [ 'prefLabel', 'inParens:specification' ],
            scrollToMiddleOfResultSet: true
          },
          workseries: {
            type: 'workSeries',
            selectIndexLabel: 'workSeriesLabel',
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
            enableEditResource: true
          },
          {
            resourceType: 'Person',
            wrappedIn: 'PublicationPart',
            predicate: 'agent',
            enableEditResource: true
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
            enableEditResource: true
          },
          {
            resourceType: 'Place',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableEditResource: true
          },
          {
            resourceType: 'Event',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableEditResource: true
          },
          {
            resourceType: 'Work',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableEditResource: true
          },
          {
            resourceType: 'Subject',
            wrappedIn: '/Work',
            predicate: 'subject',
            enableEditResource: true
          },
          {
            resourceType: '/Work',
            wrappedIn: 'PublicationPart',
            predicate: 'publicationOf',
            enableEditResource: true
          }
        ],
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
        },
        inverseLabels: {
          'Emne': 'Som emne',
          'Utgivelse av': 'Har utgivelse',
          'Har delutgivelse': 'Utgitt som del',
          'Subject': 'As subject',
          'Publication of': 'Published',
          'Has publication part': 'Published as part'
        }
      }
    response.json(config)
  })
}
