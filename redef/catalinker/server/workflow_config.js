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

module.exports = (app) => {
  app.get('/config/:mediaType(book|film|audible|musical_score|musical_recording|game)|/config', function (request, response) {
    var mediaType = request.params.mediaType
    console.log(mediaType)
    function includeOnlyFor (targetTypes, object) {
      return (_.isArray(targetTypes) && _.contains(targetTypes, mediaType) || targetTypes === mediaType) ? object : null
    }

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
              rdfProperty: 'nationality'
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
            }
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
            }
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
            }
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
              type: 'input-string',
              // input type must be defined explicitly, otherwise it will inherit from the search field above
              preFillFromSearchField: true // value of this field should be copied from the search field above
            },
            {
              label: 'Undertittel',
              type: 'input-string', // input type must be defined explicitly, otherwise it will inherit from the search field above
              rdfProperty: 'subtitle'
            }
          ]
        },
        {
          id: 'create-place-form',
          labelForCreateButton: 'Opprett nytt sted',
          rdfType: 'Place',
          inputs: [
            {
              label: 'Foretrukken betegnelse',
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
            }
          ]
        },
        {
          id: 'create-event-form',
          labelForCreateButton: 'Opprett ny hendelse',
          rdfType: 'Event',
          inputs: [
            {
              label: 'Foretrukken betegnelse',
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
              rdfProperty: 'number',
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
            }
          ]
        },
        {
          id: 'create-serial-form',
          labelForCreateButton: 'Opprett ny serie',
          rdfType: 'Serial',
          inputs: [
            {
              label: 'Navn',
              rdfProperty: 'name',
              type: 'input-string',
              displayValueSource: true,
              preFillFromSearchField: true
            }
          ]
        },
        {
          id: 'create-instrument-form',
          labelForCreateButton: 'Opprett nytt musikkinstrument',
          rdfType: 'Instrument',
          inputs: [
            {
              label: 'Foretrukken betegnelse',
              rdfProperty: 'prefLabel',
              type: 'input-string',
              preFillFromSearchField: true
            },
            {
              label: 'Forklarende tilføyelse',
              rdfProperty: 'specification',
              type: 'input-string'
            }
          ]
        },
        {
          id: 'create-compositiontype-form',
          labelForCreateButton: 'Opprett ny komposisjonstype',
          rdfType: 'CompositionType',
          inputs: [
            {
              label: 'Foretrukken betegnelse',
              rdfProperty: 'prefLabel',
              type: 'input-string',
              preFillFromSearchField: true
            },
            {
              label: 'Forklarende tilføyelse',
              rdfProperty: 'specification',
              type: 'input-string'
            }
          ]
        }
      ],
      tabs: [
        {
          id: 'confirm-person',
          rdfType: 'Work',
          label: 'Hovedinnførsel',
          inputs: [
            includeOnlyFor(
              [ 'book', 'audible', 'musical_score' ], {
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchForValueSuggestions: {
                  label: 'ISBN',
                  parameterName: 'isbn',
                  automationId: 'searchValueSuggestions',
                  showOnlyWhenMissingTargetUri: 'Work', // only show this search field if a work has not been loaded or created
                  sources: [ 'bibbi', 'loc' ],
                  preferredSource: {
                    id: 'bibbi',
                    name: 'Biblioteksentralen'
                  }
                }
              }
            ),
            includeOnlyFor(
              [ 'film', 'musical_recording', 'game' ], {
                // this is an input type used to search for a main resource, e.g. Work. The rendered input field
                // will not be tied to a particular subject and predicate
                searchForValueSuggestions: {
                  label: 'EAN',
                  parameterName: 'ean',
                  automationId: 'searchEanValueSuggestions',
                  showOnlyWhenMissingTargetUri: 'Work', // only show this search field if a work has not been loaded or created
                  sources: [ 'bibbi' ],
                  preferredSource: {
                    id: 'bibbi',
                    name: 'Biblioteksentralen'
                  }
                }
              }
            ),
            {
              label: "Verket har ikke hovedansvarlig",
              id: 'missingMainEntry',
              rdfProperty: 'missingMainEntry',
            },
            {
              label: 'Hovedansvarlig',
              id: 'mainEntryInput',
              showOnlyWhen: {
                inputId: 'missingMainEntry',
                valueAsStringMatches: '^false$'
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
              label: "Verket er ikke et selvstendig verk",
              rdfProperty: 'improperWork',
            },
            {
              // this is an input type used to search for a main resource, e.g. Work. The rendered input field
              // will not be tied to a particular subject and predicate
              id: 'searchMainResourceInput',
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
                    formId: 'create-work-form',
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
                'Work': [ 'mainTitle', 'subtitle', 'partTitle', 'partNumber', 'language' ]
              }
            }
          }
        },
        {
          id: 'describe-publication',
          rdfType: 'Publication',
          label: 'Beskriv utgivelse',
          inputs: [
            { rdfProperty: 'publicationOf', type: 'entity' },
            {
              rdfProperty: 'mainTitle',
              id: 'publicationMainTitle',
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
            includeOnlyFor([ 'book', 'musical_score' ], { rdfProperty: 'numberOfPages' }),
            includeOnlyFor([ 'book', 'musical_score' ], { rdfProperty: 'illustrativeMatter' }),
            includeOnlyFor([ 'book', 'musical_score' ], {
              rdfProperty: 'isbn',
              multiple: true,
              addAnotherLabel: 'Legg til et ISBN-nummer til'
            }),
            includeOnlyFor([ 'film', 'musical_recording' ], {
              rdfProperty: 'hasEan'
            }),
            includeOnlyFor(
              'book', {
                rdfProperty: 'binding'
              }
            ),
            { rdfProperty: 'language' },
            includeOnlyFor(
              'film', {
                rdfProperty: 'hasSubtitles'
              }
            ),
            { rdfProperty: 'format', multiple: true },
            includeOnlyFor(
              [ 'film', 'musical_recording' ,'audible'], {
                rdfProperty: 'duration',
                type: 'input-duration'
              }
            ),
            includeOnlyFor(
              [ 'film', 'game' ], {
                rdfProperty: 'ageLimit',
                widgetOptions: {
                  short: true
                }
              }
            ),
            includeOnlyFor('book', { rdfProperty: 'writingSystem', multiple: true }),
            { rdfProperty: 'hasFormatAdaptation', multiple: true },
            {
              id: 'publishedByInput',
              rdfProperty: 'publishedBy',
              authority: true, // this indicates it is an authorized entity
              nameProperties: [ 'name' ], // these are property names used to label already connected entities
              indexTypes: [ 'corporation', 'person' ], // this is the name of the elasticsearch index type from which authorities are searched within
              preselectFirstIndexType: true,
              indexDocumentFields: [ 'name' ], // these are indexed document JSON properties from which the labels f
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
                order: 50,
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
              addAnotherLabel: 'Legg til en serie til',
              subjects: [ 'Publication' ],
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
                    nameProperties: [ 'name' ],
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
            }
          ],
          nextStep: {
            buttonLabel: 'Neste steg: Verksopplysninger'
          },
          deleteResource: {
            buttonLabel: 'Slett utgivelsen',
            resourceType: 'Publication',
            dialogKeypath: 'deletePublicationDialog',
            dialogId: 'delete-publication-dialog',
            dialogTemplateValues: {
              work: 'workMainTitle',
              title: 'publicationMainTitle',
              creator: 'mainEntryPersonInput'
            },
            afterSuccess: {
              gotoTab: 0,
              setResourceInDocumentUrlFromTargetUri: 'Work'
            }
          }
        },
        {
          id: 'describe-work',
          rdfType: 'Work',
          label: 'Beskriv verk',
          inputs: [
            {
              id: 'workMainTitle',
              rdfProperty: 'mainTitle',
              multiple: true
            },
            { rdfProperty: 'subtitle' },
            { rdfProperty: 'partTitle' },
            { rdfProperty: 'partNumber' },
            { rdfProperty: 'publicationYear' },
            { rdfProperty: 'language', multiple: true },
            {
              rdfProperty: 'literaryForm',
              multiple: true,
              headlinePart: {
                order: 45
              }
            },
            { rdfProperty: 'audience', multiple: true },
            { rdfProperty: 'biography', multiple: true },
            { rdfProperty: 'hasContentAdaptation', multiple: true },
            {
              label: 'Relasjon til annet verk',
              multiple: true,
              addAnotherLabel: 'Legg til en relasjon til',
              subInputs: {
                rdfProperty: 'isRelatedTo',
                range: 'WorkRelation',
                inputs: [
                  {
                    label: 'Verk',
                    rdfProperty: 'work',
                    id: 'relatedToWorkInput',
                    required: true,
                    indexTypes: [ 'work' ],
                    type: 'searchable-with-result-in-side-panel',
                    nameProperties: [ 'mainTitle' ],
                    widgetOptions: {
                      enableCreateNewResource: {
                        formRefs: [
                          {
                            formId: 'create-work-form',
                            targetType: 'work'
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
                    },
                  }
                ]
              },
              subjects: [ 'Work' ], // blank node can be attached to the the loaded resource of one of these types
            },
            {
              rdfProperty: 'hasSummary',
              type: 'input-string-large'
            },
          ],
          nextStep: {
            buttonLabel: 'Neste steg: Beskriv verket'
          },
          deleteResource: {
            buttonLabel: 'Slett verket',
            resourceType: 'Work',
            dialogKeypath: 'deleteWorkDialog',
            dialogId: 'delete-work-dialog',
            dialogTemplateValues: {
              title: 'workMainTitle',
              creator: 'mainEntryPersonInput'
            },
            afterSuccess: {
              gotoTab: 0
            }
          }
        },
        {
          id: 'subjects',
          rdfType: 'Work',
          label: 'Emneopplysninger',
          inputs: [
            includeOnlyFor('musical_score', {
              rdfProperty: 'hasCompositionType',
              type: 'searchable-with-result-in-side-panel',
              nameProperties: [ 'prefLabel' ],
              indexTypes: [ 'compositiontype' ],
              labelForCreateButton: 'Opprett ny kompodisjonstype',
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
            }),
            includeOnlyFor([ 'musical_score', 'musical_recording' ], {
              rdfProperty: 'inKey',
              multiple: true
            }),
            includeOnlyFor('musical_score', {
              label: 'Besetning',
              multiple: true,
              addAnotherLabel: 'Legg til et instrument til',
              subInputs: {
                rdfProperty: 'hasInstrument',
                range: 'Instrumentation',
                inputs: [
                  {
                    label: 'Instrument',
                    rdfProperty: 'hasInstrument',
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
                    },
                    required: true
                  }
                ]
              },
              subjects: [ 'Work' ], // blank node can be attached to the the loaded resource of one of these types
            }),
            {
              rdfProperty: 'subject',
              id: 'subjectInput',
              multiple: true,
              addAnotherLabel: 'Legg til et emne til',
              type: 'searchable-with-result-in-side-panel',
              loadWorksAsSubjectOfItem: true,
              authority: true, // this indicates it is an authorized entity
              nameProperties: [ 'prefLabel', 'mainTitle', 'subTitle', 'name' ], // these are property names used to label already connected entities
              indexTypes: [ 'subject', 'person', 'corporation', 'work', 'place', 'event' ], // this is the name of the elasticsearch index type from which authorities are searched within
              widgetOptions: {
                selectIndexTypeLegend: 'Velg emnetype',
                enableCreateNewResource: {
                  formRefs: [ {
                    formId: 'create-subject-form',
                    targetType: 'subject' // these are matched against index types, hence lower case
                  },
                    {
                      formId: 'create-work-form',
                      targetType: 'work'
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
                }
              }
            },
            {
              label: 'Dewey-klassifikasjon',
              multiple: true,
              addAnotherLabel: 'Legg til en klassifikasjon til',
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
              nameProperties: [ 'prefLabel' ],
              indexTypes: [ 'genre' ],
              indexDocumentFields: [ 'prefLabel' ],
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
            buttonLabel: 'Neste steg: Beskriv deler'
          }
        },
        {
          id: 'collection-of-works',
          rdfType: 'Publication',
          label: 'Beskriv deler',
          inputs: [
            {
              label: 'Verk som inngår i samling',
              multiple: true,
              subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
                rdfProperty: 'hasPublicationPart', // the rdf property of the resource
                range: 'PublicationPart', // this is the shorthand name of the type of the blank node
                accordionHeader: 'collection',
                orderBy: [ 'startsAtPageInput' ],
                inputs: [
                  {
                    label: 'Aktør',
                    rdfProperty: 'agent',
                    indexTypes: [ 'person', 'corporation' ],
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
                      }
                    }
                  },
                  {
                    label: 'Rolle',
                    rdfProperty: 'role'
                  },
                  {
                    label: 'Tittel på delverk',
                    rdfProperty: 'mainTitle',
                    required: true,
                  },
                  {
                    label: 'Originaltittel',
                    id: 'publicationPartWorkInput',
                    rdfProperty: 'publicationOf',
                    type: 'searchable-with-result-in-side-panel',
                    nameProperties: [ 'mainTitle', 'subTitle' ], // these are property names used to label already connected entities
                    indexTypes: [ 'work' ], // this is the name of the elasticsearch index type from which authorities are searched within
                    indexDocumentFields: [ 'mainTitle' ],
                    widgetOptions: {
                      enableCreateNewResource: {
                        formRefs: [ {
                          formId: 'create-work-form',
                          targetType: 'work' // these are matched against index types, hence lower case
                        } ]
                      }
                    }
                  },
                  {
                    label: 'Skal ikke vises som verk',
                    rdfProperty: 'improperWork'
                  },
                  // the following pair of properties is a range, which will be placed on the same line, with the label of the first one only.
                  {
                    label: 'Sidetall',
                    id: 'startsAtPageInput',
                    rdfProperty: 'startsAtPage',
                    widgetOptions: {
                      isRangeStart: true,
                    }
                  },
                  {
                    rdfProperty: 'endsAtPage',
                    widgetOptions: {
                      isRangeEnd: true,
                    }
                  }
                ]
              },
              addAnotherLabel: 'Legg til et delverk til',
              subjects: [ 'Publication' ]
            }
          ],
          nextStep: {
            buttonLabel: 'Neste steg: Biinnførsler'
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
            maintenanceInputs('Serier', 'serial'),
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
                editWithTemplate: "workflow"
              }
            },
            {
              searchMainResource: {
                label: 'Verk',
                indexType: 'workUnstructured'
              },
              widgetOptions: {
                editWithTemplate: "workflow",
                editSubItemWithTemplate: "workflow"
              }
            }
          ]
        }
      ],
      search: {
        person: {
          type: 'person',
          selectIndexLabel: 'Person',
          queryTerms: [ {
            field: 'name',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'name' ],
          resultItemDetailsLabelProperties: [ 'lifeSpan', 'nationality' ],
          itemHandler: 'personItemHandler',
          subItemsExpandTooltip: 'Vis/skjul verk'
        },
        subject: {
          type: 'subject',
          selectIndexLabel: 'Generelt',
          queryTerms: [ {
            field: 'prefLabel',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'prefLabel' ]
        },
        work: {
          type: 'work',
          structuredQuery: true,
          selectIndexLabel: 'Verk',
          queryTerms: [ {
            field: 'mainTitle',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'mainTitle', 'subTitle' ],
          resultItemDetailsLabelProperties: [ 'creator' ],
          itemHandler: 'workItemHandler'
        },
        workUnstructured: {
          type: 'work',
          selectIndexLabel: 'Verk',
          queryTerms: [
            { field: 'mainTitle', wildcard: true },
            { field: 'partTitle', wildcard: true },
            { field: 'subtitle', wildcard: true },
            { field: 'publicationYear' }
          ],
          legend: 'Søk etter tittel og/eller utgivelsesår',
          resultItemLabelProperties: [ 'mainTitle', 'subTitle', 'publicationYear' ],
          resultItemDetailsLabelProperties: [ 'creator' ],
          itemHandler: 'workItemHandler',
          subItemsExpandTooltip: 'Vis/skjul utgivelser'
        },
        genre: {
          type: 'genre',
          selectIndexLabel: 'Sjanger',
          queryTerms: [ {
            field: 'prefLabel',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'prefLabel' ]
        },
        corporation: {
          type: 'corporation',
          selectIndexLabel: 'Organisasjon',
          queryTerms: [ {
            field: 'name',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'name' ]
        },
        place: {
          type: 'place',
          selectIndexLabel: 'Sted',
          queryTerms: [ {
            field: 'prefLabel',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'prefLabel', 'specification' ]
        },
        event: {
          type: 'event',
          selectIndexLabel: 'Hendelse',
          queryTerms: [ {
            field: 'prefLabel',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'prefLabel', 'specification' ]
        },
        serial: {
          type: 'serial',
          selectIndexLabel: 'Serie',
          queryTerms: [ {
            field: 'name',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'name' ]
        },
        publication: {
          type: 'publication',
          selectIndexLabel: 'Utgivelse',
          queryTerms: [
            { field: 'recordId' },
            { field: 'mainTitle', wildcard: true },
            { field: 'subTitle', wildcard: true },
            { field: 'mainEntryName', wildcard: true }
          ],
          legend: 'Søk etter tittel , tittelnummer eller hovedinnførsel.',
          resultItemLabelProperties: [ 'creator', 'mainTitle', 'subTitle', 'publicationYear', 'recordId' ],
          itemHandler: 'publicationItemHandler'
        },
        instrument: {
          type: 'instrument',
          selectIndexLabel: 'Instrument',
          queryTerms: [ {
            field: 'prefLabel',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'prefLabel', 'specification' ]
        },
        compositiontype: {
          type: 'compositiontype',
          selectIndexLabel: 'Komposisjonstype',
          queryTerms: [ {
            field: 'prefLabel',
            wildcard: true
          } ],
          resultItemLabelProperties: [ 'prefLabel', 'specification' ]
        }
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
        compositiontype: 'CompositionType'
      },
      prefillValuesFromExternalSources: [
        { resourceType: 'Work' },
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
        ]
    }
    response.json(config)
  })
}

