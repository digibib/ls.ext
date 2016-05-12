var express = require('express')
var path = require('path')
var logger = require('morgan')
var browserify = require('browserify-middleware')
var axios = require('axios')
var compileSass = require('express-compile-sass')
var app = express()
var requestProxy = require('express-request-proxy')

if (app.get('env') === 'development') {
  var livereload = require('express-livereload')
  livereload(app, {})

  app.use(require('connect-livereload')({
    port: 35729
  }))
}
var Server

app.use(logger('dev'))
app.use(express.static(path.join(__dirname, '/../public')))

app.get('/js/bundle.js', browserify([ './client/src/main', 'jquery', 'ractive-decorators-select2', 'select2', 'ractive-multi-decorator', { './client/src/bootstrap': { run: true } } ]))
app.get('/js/bundle_for_old.js', browserify([ './client/src/main_old' ]))

app.get('/css/vendor/:cssFile', function (request, response) {
  response.sendFile(request.params.cssFile, { root: path.resolve(path.join(__dirname, '/../node_modules/select2/dist/css/')) })
})

function newResource (type) {
  return axios.post(process.env.SERVICES_PORT + '/' + type, {}, {
      headers: {
        Accept: 'application/ld+json',
        'Content-Type': 'application/ld+json'
      }
    })
    .catch(function (response) {
      if (response instanceof Error) {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', response.message)
      } else {
        // The request was made, but the server responded with a status code
        // that falls out of the range of 2xx
        console.log(response.data)
        console.log(response.status)
        console.log(response.headers)
        console.log(response.config)
      }
    })
}

app.get('/', function (req, res) {
  res.redirect('/cataloguing')
})

app.get('/cataloguing_old/*', function (req, res, next) {
  res.sendFile('main_old.html', { title: 'Katalogisering', root: path.join(__dirname, '/../public/') })
})

app.get('/cataloguing', function (req, res, next) {
  res.sendFile('main.html', { title: 'Katalogisering', root: path.join(__dirname, '/../public/') })
})

app.get('/:type(person|work|publication|place|serial|publisher|subject|genre)', function (req, res, next) {
  newResource(req.params.type).then(function (response) {
    res.redirect('/cataloguing_old/' + req.params.type + '?resource=' + response.headers.location)
  })
})

app.get('/config', function (request, response) {
  function manintenanceInputs(label, type){
    return {
      // this is an input type used to search for a main resource, e.g. Work. The rendered input field
      // will not be tied to a particular subject and predicate
      searchMainResource: {
        label: label,
        indexType: type
      },
      // this is used to control how the search result in the support panel behaves
      widgetOptions: {
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

  var config =
  {
    kohaOpacUri: (process.env.KOHA_OPAC_PORT || 'http://192.168.50.12:8080').replace(/^tcp:\//, 'http:/'),
    kohaIntraUri: (process.env.KOHA_INTRA_PORT || 'http://192.168.50.12:8081').replace(/^tcp:\//, 'http:/'),
    ontologyUri: '/services/ontology',
    resourceApiUri: '/services/',
    inputForms: [
      {
        id: "create-person-form",
        rdfType: "Person",
        labelForCreateButton: "Opprett ny person",
        inputs: [
          {
            rdfProperty: 'name',
            displayValueSource: true,
            // after resource is created, the value entered
            // in input marked with this is used to populate displayValue of the parent input
            preFillFromSearchField: true,
            type: "input-string"
          },
          {
            rdfProperty: 'birthYear'
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
          }
        ]
      },
      {
        id: "create-subject-form",
        labelForCreateButton: "Opprett nytt generelt emne",
        rdfType: "Subject",
        inputs: [
          {
            rdfProperty: 'prefLabel',
            displayValueSource: true,
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
        id: "create-genre-form",
        labelForCreateButton: "Opprett ny sjanger",
        rdfType: "Genre",
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
            rdfProperty: 'specification',
            type: 'input-string-large'
          }
        ]
      },
      {
        id: "create-publisher-form",
        labelForCreateButton: "Opprett ny utgiver",
        rdfType: "Publisher",
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
        id: "create-work-form",
        labelForCreateButton: "Opprett nytt verk",
        rdfType: "Work",
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
        id: "create-place-form",
        labelForCreateButton: "Opprett nytt sted",
        rdfType: "Place",
        inputs: [
          {
            label: 'Foretrukken betegnelse',
            rdfProperty: 'prefLabel',
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
      }
    ],
    tabs: [
      {
        id: 'confirm-person',
        rdfType: 'Work',
        label: 'Hovedinnførsel',
        inputs: [
          {
            label: 'Person (hovedinnførsel)',
            subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
              rdfProperty: 'contributor', // the rdf property of the resource
              range: 'Contribution', // this is the shorthand name of the type of the blank node
              inputs: [ // these are the actual sub inputs
                {
                  label: 'Person',
                  rdfProperty: 'agent',
                  indexTypes: 'person',
                  type: 'searchable-with-result-in-side-panel',
                  dependentResourceTypes: [ 'Work', 'Publication' ], // when the creator is changed, unload current work and publication
                  widgetOptions: {
                    showSelectWork: true, // show and enable select work radio button
                    enableCreateNewResource: {
                      formRefs: [ {
                        formId: 'create-person-form',
                        targetType: "person"
                      } ],
                      useAfterCreation: false
                    }
                  }
                },
                {
                  label: 'Rolle',
                  rdfProperty: 'role'
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
            // this is an input type used to search for a main resource, e.g. Work. The rendered input field
            // will not be tied to a particular subject and predicate
            searchMainResource: {
              label: 'Søk etter eksisterende verk',
              indexType: 'work',
              isRoot: true,
              automationId: 'searchWorkAsMainResource',
              showOnlyWhenMissingTargetUri: 'Work' // only show this search field if a work has not been loaded or created
            },
            // this is used to control how the search result in the support panel behaves
            widgetOptions: {
              // make it possible to create a work resource if necessary,
              enableCreateNewResource: {
                formRefs: [ {
                  formId: 'create-work-form',
                  targetType: "work"
                } ],
                useAfterCreation: true
              }
            }
          }
        ],
        nextStep: {
          buttonLabel: 'Neste steg: Beskrivelse',
          createNewResource: {
            type: 'Publication',
            prefillValuesFromResource: {
              "Work": [ "mainTitle", "subtitle", "partTitle", "partNumber", "language" ]
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
          { rdfProperty: 'mainTitle' },
          { rdfProperty: 'subtitle' },
          { rdfProperty: 'partTitle' },
          { rdfProperty: 'partNumber' },
          { rdfProperty: 'edition' },
          { rdfProperty: 'publicationYear' },
          { rdfProperty: 'numberOfPages' },
          { rdfProperty: 'illustrativeMatter' },
          { rdfProperty: 'isbn', multiple: true },
          { rdfProperty: 'binding' },
          { rdfProperty: 'language' },
          { rdfProperty: 'format', multiple: true },
          { rdfProperty: 'writingSystem', multiple: true },
          { rdfProperty: 'adaptationOfPublicationForParticularUserGroups', multiple: true },
          {
            rdfProperty: 'publishedBy',
            authority: true, // this indicates it is an authorized entity
            nameProperties: [ 'name' ], // these are property names used to label already connected entities
            indexTypes: 'publisher', // this is the name of the elasticsearch index type from which authorities are searched within
            indexDocumentFields: [ 'name' ], // these are indexed document JSON properties from which the labels f
            // or authoroty select list are concatenated
            type: 'searchable-with-result-in-side-panel',
            widgetOptions: {
              enableCreateNewResource: {
                formRefs: [ {
                  formId: 'create-publisher-form',
                  targetType: "publisher"
                }]
              }
            }
          },
          {
            rdfProperty: 'hasPlaceOfPublication',
            authority: true, // this indicates it is an authorized entity
            nameProperties: [ 'prefLabel', 'specification' ], // these are property names used to label already connected entities
            indexTypes: 'place', // this is the name of the elasticsearch index type from which authorities are searched within
            // the labels for authoroty select list are concatenated
            type: 'searchable-with-result-in-side-panel',
            widgetOptions: {
              enableCreateNewResource: {
                formRefs: [ {
                  formId: 'create-place-form',
                  targetType: "place"
                }]
              }
            }
          },
          {
            label: 'Serie',
            multiple: true,
            subjects: ['Publication'],
            subInputs: {
              rdfProperty: 'inSerial',
              range: 'SerialIssue',
              inputs: [
                {
                  label: 'Serie',
                  rdfProperty: 'serial',
                  indexTypes: 'serial',
                  nameProperties: [ 'name' ],
                  type: 'searchable-with-result-in-side-panel',
                  widgetOptions: {
                    showSelectWork: false, // show and enable select work radio button
                    enableCreateNewResource: {
                      formRefs: [ {
                        formId: 'create-serial-form',
                        targetType: "serial"
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
        }
      },
      {
        id: 'describe-work',
        rdfType: 'Work',
        label: 'Beskriv verk',
        inputs: [
          { rdfProperty: 'mainTitle' },
          { rdfProperty: 'subtitle' },
          { rdfProperty: 'partTitle' },
          { rdfProperty: 'partNumber' },
          { rdfProperty: 'publicationYear' },
          { rdfProperty: 'language', multiple: true },
          { rdfProperty: 'literaryForm', multiple: true },
          { rdfProperty: 'audience', multiple: true },
          { rdfProperty: 'biography', multiple: true },
          { rdfProperty: 'adaptationOfWorkForParticularUserGroups', multiple: true }
        ],
        nextStep: {
          buttonLabel: 'Neste steg: Beskriv verket'
        }
      },
      {
        id: 'subjects',
        rdfType: 'Work',
        label: 'Emneopplysninger',
        inputs: [
          {
            rdfProperty: 'subject',
            multiple: true,
            type: 'searchable-with-result-in-side-panel',
            loadWorksAsSubjectOfItem: true,
            authority: true, // this indicates it is an authorized entity
            nameProperties: [ 'name', 'prefLabel' ], // these are property names used to label already connected entities
            indexTypes: [ 'subject', 'person', 'work', 'place' ], // this is the name of the elasticsearch index type from which authorities are searched within
            widgetOptions: {
              selectIndexTypeLegend: 'Velg emnetype',
              enableCreateNewResource: {
                formRefs: [ {
                  formId: 'create-subject-form',
                  targetType: "subject" // these are matched against index types, hence lower case
                },
                {
                  formId: 'create-work-form',
                  targetType: "work"
                },
                {
                  formId: 'create-person-form',
                  targetType: "person"
                },
                {
                  formId: 'create-place-form',
                  targetType: "place"
                } ]
              }
            }
          },
          {
            rdfProperty: 'genre',
            multiple: true,
            type: 'searchable-with-result-in-side-panel',
            authority: true,
            nameProperties: [ 'name' ],
            indexTypes: ['genre'],
            indexDocumentFields: [ 'name' ],
            widgetOptions: {
              enableCreateNewResource: {
                formRefs: [ {
                  formId: 'create-genre-form',
                  targetType: "genre"
                }]
              }
            }
          }
        ],
        nextStep: {
          buttonLabel: 'Neste steg: Biinnførsler'
        }
      }
      ,
      {
        // additional entries, such as translator, illustrator, composer etc
        id: 'confirm-addedentry',
        rdfType: 'Work',
        label: 'Biinnførsler',
        inputs: [
          {
            label: 'Biinnførsel',
            multiple: true, // can have many of these
            subInputs: { // input is a group of sub inputs, which are connected to resource as other ends of a blank node
              rdfProperty: 'contributor', // the rdf property of the resource
              range: 'Contribution', // this is the shorthand name of the type of the blank node
              inputs: [ // these are the actual sub inputs
                {
                  label: 'Person',
                  rdfProperty: 'agent',
                  indexTypes: 'person',
                  type: 'searchable-with-result-in-side-panel',
                  widgetOptions: {
                    showSelectWork: false, // show and enable select work radio button
                    enableCreateNewResource: {
                      formRefs: [ {
                        formId: 'create-person-form',
                        targetType: "person"
                      } ],
                      useAfterCreation: false
                    }
                  }
                },
                {
                  label: 'Rolle',
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
          manintenanceInputs('Personer', 'person'),
          manintenanceInputs('Emner', 'subject'),
          manintenanceInputs('Sjangre', 'genre'),
          manintenanceInputs('Serier', 'serial')
        ]
      }
    ],
    search: {
      person: {
        selectIndexLabel: 'Person',
        queryTerm: 'person.name',
        resultItemLabelProperties: ['name'],
        resultItemDetailsLabelProperties: ['lifeSpan', 'nationality'],
        itemHandler: 'personItemHandler'
      },
      subject: {
        selectIndexLabel: 'Generelt',
        queryTerm: 'subject.prefLabel',
        resultItemLabelProperties: ['prefLabel']
      },
      work: {
        selectIndexLabel: 'Verk',
        queryTerm: 'work.mainTitle',
        resultItemLabelProperties: ['mainTitle', 'subTitle'],
        resultItemDetailsLabelProperties: ['creator'],
        itemHandler: 'workItemHandler'
      },
      genre: {
        selectIndexLabel: 'Sjanger',
        queryTerm: 'genre.name',
        resultItemLabelProperties: ['name']
      },
      publisher: {
        selectIndexLabel: 'Utgiver',
        queryTerm: 'publisher.name',
        resultItemLabelProperties: ['name']
      },
      place: {
        selectIndexLabel: 'Sted',
        queryTerm: 'place.prefLabel',
        resultItemLabelProperties: ['prefLabel', 'specification']
      },
      serial: {
        selectIndexLabel: 'Serie',
        queryTerm: 'serial.name',
        resultItemLabelProperties: ['name']
      }
    }
  }
  response.json(config)
})

app.get('/version', function (request, response) {
  response.json({ 'buildTag': process.env.BUILD_TAG, 'gitref': process.env.GITREF })
})

var services = (process.env.SERVICES_PORT || 'http://services:8005').replace(/^tcp:\//, 'http:/')
app.all('/services/*', requestProxy({
  url: services + '/*'
}))

app.use('/style', compileSass({
  root: path.join(__dirname, '/../client/scss'),
  sourceMap: true, // Includes Base64 encoded source maps in output css
  sourceComments: false, // Includes source comments in output css
  watchFiles: true, // Watches sass files and updates mtime on main files for each change
  logToConsole: true // If true, will log to console.error on errors
}))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

Server = app.listen(process.env.BIND_PORT || 8010, process.env.BIND_IP, function () {
  var host = Server.address().address
  var port = Server.address().port
  console.log('Catalinker server listening at http://%s:%s', host, port)
})

module.exports = app
