/*global window,location,history*/
;(function (root, factory) {
  'use strict'

  if (typeof module === 'object' && module.exports) {
    var Ractive = require('ractive')
    Ractive.events = require('ractive-events-keys')
    var axios = require('axios')
    var Graph = require('./graph')
    var Ontology = require('./ontology')
    var StringUtil = require('./stringutil')
    var _ = require('underscore')
    var $ = require('jquery')
    var ldGraph = require('ld-graph')
    var URI = require('urijs')
    module.exports = factory(Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI)
  } else {
    // Browser globals (root is window)
    root.Main = factory(root.Ractive, root.axios, root.Graph, root.Ontology, root.StringUtil, root._, root.$, root.ldGraph, root.URI)
  }
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI) {
    'use strict'

    Ractive.DEBUG = false
    var ractive

    var deepClone = function (object) {
      var clone = _.clone(object)

      _.each(clone, function (value, key) {
        if (_.isObject(value)) {
          clone[ key ] = deepClone(value)
        }
      })

      return clone
    }

    // need to leave already parsed JSON from axios
    var ensureJSON = function (res) {
      return (typeof res === 'string') ? JSON.parse(res) : res
    }

    var proxyToServices = function (url) {
      var r = new RegExp('http://[^/]+/')
      return url.replace(url.match(r), '/services/')
    }

    function unPrefix (prefixed) {
      return _.last(prefixed.split(':'))
    }

    function clearSupportPanels (options) {
      var keepActions = (options || {}).keep || []
      _.each(allInputs(), function (input) {
        _.each(input.values, function (value) {
          if (value.searchResult) {
            value.searchResult = null
          }
        })
      })
      _.each(ractive.get('applicationData.maintenanceInputs'), function (input, index) {
        if (!ractive.get('applicationData.maintenanceInputs.' + index + '.widgetOptions.enableCreateNewResource.showInputs')) {
          if (input.widgetOptions) {
            _.each(_.difference([ 'enableCreateNewResource', 'enableEditResource' ], keepActions), function (action) {
              if (input.widgetOptions[ action ]) {
                input.widgetOptions[ action ].showInputs = null;
                input.values[ 0 ].searchResult = null
                var domainType = input.widgetOptions[ action ].forms[ input.selectedIndexType ].rdfType
                unloadResourceForDomain(domainType)
              }
            })
          }
        }
      })
      ractive.update()
    }

    function clearMaintenanceInputs () {
      _.each(ractive.get('applicationData.maintenanceInputs'), function (input) {
        input.values = emptyValues(false, true)
      })
    }

    var unloadResourceForDomain = function (domainType) {
      _.each(allInputs(), function (input) {
        if (input.domain && domainType === unPrefix(input.domain)) {
          input.values = emptyValues(false, false)
        }
      })
      ractive.update()
      ractive.set('targetUri.' + domainType, null)
      updateBrowserLocationWithUri(domainType, null)
    }

    function i18nLabelValue (label) {
      if (Array.isArray(label)) {
        return _.find(label, function (labelValue) {
          return (labelValue[ '@language' ] === 'no')
        })[ '@value' ]
      } else {
        return label[ '@value' ]
      }
    }

    function propertyName (predicate) {
      return _.last(predicate.split('#'))
    }

    function setMultiValues (values, input, index, options) {
      options = options || {}
      if (values && values.length > 0) {
        var valuesAsArray = values.length === 0 ? [] : _.map(values, function (value) {
          return value.id
        })
        if (!input.values[ index ]) {
          input.values[ index ] = {}
        }
        input.values[ index ].old = {
          value: valuesAsArray
        }
        input.values[ index ].current = {
          value: valuesAsArray,
          uniqueId: _.uniqueId()
        }
        input.values[ index ].uniqueId = _.uniqueId()
        if (options.onlyValueSuggestions) {
          input.values[ index ].suggested = {source: options.source}
        }
        return valuesAsArray
      }
    }

    function setSingleValue (value, input, index, options) {
      options = options || {}
      if (value) {
        if (!input.values[ index ]) {
          input.values[ index ] = {}
        }
        input.values[ index ].old = {
          value: options.isNew ? null : value.value,
          lang: options.isNew ? null : value.lang
        }
        input.values[ index ].current = {
          value: value.value,
          lang: value.lang
        }
        input.values[ index ].uniqueId = _.uniqueId()
      }
    }

    function setIdValue (id, input, index, predicate) {
      input.values = input.values || []
      if (!input.values[ index ]) {
        input.values[ index ] = {}
      }
      if (predicate) {
        input.values[ index ].predicate = predicate
      }
      input.values[ index ].old = {
        value: id
      }
      input.values[ index ].current = {
        value: id
      }
      input.values[ index ].uniqueId = _.uniqueId()
    }

    function setDisplayValue (input, index, root, options) {
      options = options || {}
      var uri = input.values[ index ].current.value

      function fromRoot (root) {
        var values = _.compact(_.reduce(input.nameProperties || [ 'name' ],
          function (values, nameProperty) {
            values.push((root.getAll(nameProperty)[ 0 ] || { value: undefined }).value)
            return values
          }, [])).join(' - ');

        var multiple = input.isSubInput ? input.parentInput.multiple : input.multiple
        if (options.onlyValueSuggestions) {
          if (multiple) {
            input.values[ index ].suggested = {source: options.source};
            input.values[ index ].current.displayValue = values
          } else {
            input.suggestedValues = input.suggestedValues || []
            input.suggestedValues[ index ] = {
              value: values,
              source: options.source
            }
          }
        } else {
          input.values[ index ].current.displayValue = values
        }
      }

      if (isBlankNodeUri(uri)) {
        if (root) {
          fromRoot(root)
          ractive.update()
        }
      } else {
        axios.get(uri).then(function (response) {
          var graphData = ensureJSON(response.data)
          var root = ldGraph.parse(graphData).byId(uri)
          fromRoot(root)
        }).then(function () {
          ractive.update()
        })
      }
    }

    function updateBrowserLocationWithUri (type, resourceUri) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      var triumphRanking = { 'Work': 1, 'Publication': 2 }
      var parametersPresentInUrl = _.keys(queryParameters)
      var triumph = _.reduce(parametersPresentInUrl, function (memo, param) {
        return triumphRanking[ param ] > triumphRanking[ memo ] ? param : memo
      }, type)
      if (triumph === type) {
        if (resourceUri) {
          queryParameters = _.omit(queryParameters, _.keys(triumphRanking))
          queryParameters[ type ] = resourceUri
        }
        oldUri.query = URI.buildQuery(queryParameters)
        history.replaceState('', '', URI.build(oldUri))
      }
    }

    function updateBrowserLocationWithTab (tabNumber) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      queryParameters[ 'openTab' ] = tabNumber
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
    }

    function loadLabelsForAuthorizedValues (values, input, index, root) {
      var promises = []
      if (input.nameProperties) {
        _.each(values, function (uri) {
          function fromRoot (root) {
            var names = _.reduce(input.nameProperties, function (parts, propertyName) {
              var all = root.getAll(propertyName)
              _.each(all, function (value, index) {
                if (!parts[ index ]) {
                  parts[ index ] = []
                }
                parts[ index ].push(value.value)
              })
              return parts
            }, [])

            _.each(names, function (nameParts) {
              var label = nameParts.join(' - ')
              ractive.set('authorityLabels.' + uri.replace(/[:\/\.]/g, '_'), label)
              input.values[ index ].current.displayName = label
              ractive.update()
              $('#sel_' + input.values[ index ].uniqueId).trigger('change')
            })
          }

          if (isBlankNodeUri(uri)) {
            if (root) {
              fromRoot(root)
            }
          } else {
            promises.push(axios.get(proxyToServices(uri)).then(function (response) {
              var graphData = ensureJSON(response.data)
              var root = ldGraph.parse(graphData).byId(uri)
              fromRoot(root)
            }))
          }
        })
      }
      return promises
    }

    function setAllowNewButtonForInput (input) {
      if (input.multiple) {
        if (typeof input.addNewHandledBySelect2 === 'undefined' || (typeof input.addNewHandledBySelect2 !== 'undefined' && !input.addNewHandledBySelect2)) {
          input.allowAddNewButton = true
        }
      }
    }

    function allInputs () {
      var inputs = _.select(ractive.get('inputs'), function (input) {
        return (input.fragment === 'publicationOf' || input.fragment === 'recordID')
      })

      _.each(ractive.get('inputGroups'), function (group) {
        _.each(group.inputs, function (input) {
          if (input.subInputs) {
            _.each(input.subInputs, function (subInput) {
              inputs.push(subInput.input)
            })
          } else {
            inputs.push(input)
          }
        })
      })

      _.each(ractive.get('applicationData.maintenanceInputs'), function (input, index) {
        _.each([ 'Edit', 'CreateNew' ], function (action) {
          var forms = (ractive.get('applicationData.maintenanceInputs.' + index + '.widgetOptions.enable' + action + 'Resource.forms'))
          if (forms) {
            _.each(forms, function (form) {
              inputs = inputs.concat(form.inputs)
            })
          }

        })
      })
      return inputs
    }

    function updateInputsForResource (response, resourceUri, options, root, type) {
      options = options || {}
      var graphData = ensureJSON(response.data)
      var offsetCrossTypes = { "Work": "Publication", "Publication": "Work" }

      var type = type || StringUtil.titelize(/^.*\/(work|person|publication|genre|subject|serial)\/.*$/g.exec(resourceUri)[ 1 ])
      var root = root || ldGraph.parse(graphData).byId(resourceUri)

      var promises = []
      _.each(allInputs(), function (input) {
        if ((input.domain && type === unPrefix(input.domain) || _.contains((input.subjects), type)) ||
          (input.isSubInput && (type === input.parentInput.domain || _.contains(input.parentInput.subjectTypes, type))) ||
          (options.onlyValueSuggestions && input.suggestValueFrom && type === unPrefix(input.suggestValueFrom.domain))) {
          input.offset = input.offset || {}
          var offset = 0;
          if (input.offset[ offsetCrossTypes[ type ] ]) {
            offset = input.offset[ offsetCrossTypes[ type ] ]
          }
          var predicate = options.onlyValueSuggestions && input.suggestValueFrom ? input.suggestValueFrom.predicate : input.predicate
          var actualRoots = input.isSubInput ? root.outAll(propertyName(input.parentInput.predicate)) : [ root ]
          var rootIndex = 0;
          _.each(actualRoots, function (root) {
            var mainEntryInput = (input.parentInput && input.parentInput.isMainEntry === true) || false
            var mainEntryNode = (root.isA('deichman:MainEntry') === true) || false
            if (mainEntryInput === mainEntryNode) {
              if (_.contains([ 'select-authorized-value', 'entity', 'searchable-authority-dropdown' ], input.type)) {
                var values = setMultiValues(root.outAll(propertyName(predicate)), input, rootIndex)
                promises = _.union(promises, loadLabelsForAuthorizedValues(values, input, 0, root))
                if (input.isSubInput) {
                  input.values[ rootIndex ].nonEditable = true
                  input.values[ rootIndex ].subjectType = type
                  input.parentInput.allowAddNewButton = true
                }
              } else if (input.type === 'searchable-with-result-in-side-panel') {
                if (!(input.suggestValueFrom && options.onlyValueSuggestions)) {
                  _.each(root.outAll(propertyName(predicate)), function (node, multiValueIndex) {
                    var index = (input.isSubInput ? rootIndex : multiValueIndex) + (offset)
                    setIdValue(node.id, input, index)
                    if (!options.onlyValueSuggestions) {
                      setDisplayValue(input, index, node)
                      if (!isBlankNodeUri(node.id)) {
                        input.values[ index ].deletable = true
                        if (input.isSubInput) {
                          input.values[ index ].nonEditable = true
                          input.parentInput.allowAddNewButton = true
                        }
                      }
                      input.values[ index ].searchable = true
                      setAllowNewButtonForInput(input)
                    } else {
                      setDisplayValue(input, index, node, options)
                    }
                    input.values[ index ].subjectType = type
                  })
                } else {
                  _.each(root.getAll(propertyName(predicate)), function (node, multiValueIndex) {
                    input.suggestedValues = input.suggestedValues || []
                    input.suggestedValues.push({
                      value: node.value,
                      source: options.source
                    })
                  })
                }
              } else if (input.type === 'select-predefined-value') {
                if (!options.onlyValueSuggestions) {
                  setMultiValues(root.outAll(propertyName(predicate)), input, (input.isSubInput ? rootIndex : 0) + (offset))
                } else {
                  var multiple = input.isSubInput ? input.parentInput.multiple : input.multiple
                  _.each(root.outAll(propertyName(predicate)), function (value) {
                    if (input.isSubInput && multiple) {
                      setMultiValues(root.outAll(propertyName(predicate)), input, (input.isSubInput ? rootIndex : 0) + (offset), options)
                    } else {
                      input.suggestedValues = input.suggestedValues || []
                      input.suggestedValues.push({
                        value: {
                          value: value.id,
                          label: Main.predefinedLabelValue(input.fragment, value.id)
                        },
                        source: options.source
                      })
                    }
                  })
                }
              } else {
                _.each(root.getAll(propertyName(predicate)), function (value, index) {
                  if (!options.onlyValueSuggestions) {
                    setSingleValue(value, input, (input.isSubInput ? rootIndex : index) + (offset))
                  } else {
                    input.suggestedValues = input.suggestedValues || []
                    input.suggestedValues.push({
                      value: value.value,
                      source: options.source
                    })
                  }
                })
              }
              rootIndex++
            }
          })
          var mainInput = input.isSubInput ? input.parentInput : input
          mainInput.subjectType = type
          input.offset[ type ] = _.flatten(_.compact(_.pluck(_.pluck(input.values, 'current'), 'value'))).length
        }
      })
      Promise.all(promises).then(function () {
        ractive.update()
        ractive.set('save_status', 'åpnet eksisterende ressurs')
        if (resourceUri) {
          ractive.set('targetUri.' + type, resourceUri)
        }
        if (!(options.keepDocumentUrl)) {
          updateBrowserLocationWithUri(type, resourceUri)
        }
      })
    }

    var fetchExistingResource = function (resourceUri, options) {
      options = options || {}
      return axios.get(resourceUri)
        .then(function (response) {
            updateInputsForResource(response, resourceUri, options)
          }
        )
      // .catch(function (err) {
      //    console.log("HTTP GET existing resource failed with:")
      //    console.log(err)
      // })
    }

    function saveInputs (inputsToSave, resourceType) {
      // force all inputs to appear as changed
      _.each(inputsToSave, function (input) {
        _.each(input.values, function (value) {
          value.old = {
            value: '',
            lang: ''
          }
        })
      })
      var errors = []
      return axios.post(ractive.get('config.resourceApiUri') + resourceType.charAt(0).toLowerCase() + resourceType.slice(1),
        {}, { headers: { Accept: 'application/ld+json', 'Content-Type': 'application/ld+json' } })
        .then(function (response) {
          var resourceUri = response.headers.location
          _.each(inputsToSave, function (input) {
            var predicate = input.predicate
            _.each(input.values, function (value) {
              Main.patchResourceFromValue(resourceUri, predicate, value, input.datatype, errors)
            })
          })
          ractive.update()
          return resourceUri
        })
      // .catch(function (err) {
      //    console.log("POST to " + resourceType.toLowerCase() + " fails: " + err)
      //    errors.push(err)
      //    ractive.set("errors", errors)
      // })
    }

    var saveNewResourceFromInputs = function (resourceType) {
      // collect inputs related to resource type

      var inputsToSave = []
      _.each(ractive.get('inputGroups'), function (group) {
        _.each(group.inputs, function (input) {
          if (resourceType === input.rdfType) {
            inputsToSave.push(input)
          }
        })
      })
      var publicationOfInput = _.find(ractive.get('inputs'), function (input) {
        return (input.fragment === 'publicationOf')
      })
      if (publicationOfInput) {
        inputsToSave.push(publicationOfInput)
      }
      saveInputs(inputsToSave, resourceType).then(function (resourceUri) {
        ractive.set('targetUri.' + resourceType, resourceUri)
        updateBrowserLocationWithUri(resourceType, resourceUri)
      })
    }

    var loadPredefinedValues = function (url, property) {
      return axios.get(url)
        .then(function (response) {
          var values = ensureJSON(response.data)
          // resolve all @id uris
          values[ '@graph' ].forEach(function (v) {
            v[ '@id' ] = Ontology.resolveURI(values, v[ '@id' ])
          })

          var valuesSorted = values[ '@graph' ].sort(function (a, b) {
            if (a[ 'rdfs:label' ][ '@value' ] < b[ 'rdfs:label' ][ '@value' ]) {
              return -1
            }
            if (a[ 'rdfs:label' ][ '@value' ] > b[ 'rdfs:label' ][ '@value' ]) {
              return 1
            }
            return 0
          })
          return { property: property, values: valuesSorted }
        }).catch(function (error) {
          console.log(error)
        })
    }

    function emptyValues (predefined, searchable) {
      return [ {
        old: { value: '', lang: '' },
        current: { value: predefined ? [] : null, lang: '' },
        uniqueId: _.uniqueId(),
        searchable: searchable === true
      } ]
    }

    function transferInputGroupOptions (prop, input) {
      if (prop.multiple) {
        input.multiple = true
      }
      if (prop.addAnotherLabel) {
        input.addAnotherLabel = prop.addAnotherLabel
      }
      if (prop.authority) {
        input.type = 'searchable-authority-dropdown'
      }
      if (prop.indexTypes) {
        input.indexTypes = _.isArray(prop.indexTypes) ? prop.indexTypes : [ prop.indexTypes ]
        input.selectedIndexType = input.indexTypes.length === 1 ? input.indexTypes[ 0 ] : undefined
      } else {
        input.selectedIndexType = ''
      }
      if (prop.indexDocumentFields) {
        input.indexDocumentFields = prop.indexDocumentFields
      }
      if (prop.type) {
        input.type = prop.type
      }
      input.visible = prop.type !== 'entity'
      if (prop.nameProperties) {
        input.nameProperties = prop.nameProperties
      }
      if (prop.dataAutomationId) {
        input.dataAutomationId = prop.dataAutomationId
      }
      if (prop.subjects) {
        input.subjects = prop.subjects
      }
      if (prop.isMainEntry) {
        input.isMainEntry = prop.isMainEntry
      }
      if (prop.cssClassPrefix) {
        input.cssClassPrefix = prop.cssClassPrefix
      } else {
        input.cssClassPrefix = 'default'
      }
      if (prop.loadWorksAsSubjectOfItem) {
        input.loadWorksAsSubjectOfItem = prop.loadWorksAsSubjectOfItem
      }
      if (prop.type === 'searchable-with-result-in-side-panel') {
        input.values[ 0 ].searchable = true
      }
      if (prop.required) {
        input.required = prop.required
      }
    }

    function markFirstAndLastInputsInGroup (group) {
      (_.findWhere(group.inputs, { visible: true }) || {}).firstInGroup = true;
      var lastFoundOrActualLast = function (lastIndexOfVisible, numberOfInputs) {
        return lastIndexOfVisible == -1 ? numberOfInputs - 1 : lastIndexOfVisible
      };
      (group.inputs[ lastFoundOrActualLast(_.findLastIndex(group.inputs, function (input) { return input.visible === true }), group.inputs.length) ] || {}).lastInGroup = true
    }

    function assignInputTypeFromRange (input) {
      switch (input.ranges[ 0 ]) {
        case 'http://www.w3.org/2001/XMLSchema#string':
          input.type = 'input-string'
          break
        case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString':
          input.type = 'input-lang-string'
          break
        case 'http://www.w3.org/2001/XMLSchema#gYear':
          input.type = 'input-gYear'
          break
        case 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger':
          input.type = 'input-nonNegativeInteger'
          break
        case 'deichman:Place':
        case 'deichman:Work':
        case 'deichman:Person':
        case 'deichman:Publisher':
        case 'deichman:Role':
        case 'deichman:Serial':
        case 'deichman:Contribution':
        case 'deichman:SerialIssue':
        case 'deichman:Subject':
        case 'deichman:Genre':
          // TODO infer from ontology that this is an URI
          // (because deichman:Work a rdfs:Class)
          input.datatype = 'http://www.w3.org/2001/XMLSchema#anyURI'
          input.type = 'input-string' // temporarily
          break
        default:
          throw new Error("Don't know which input-type to assign to range: " + input.range)
      }
    }

    function assignUniqueValueIds (input) {
      _.each(input.values, function (value) {
        value.uniqueId = _.uniqueId()
      })
    }

    var createInputGroups = function (applicationData) {
      var props = Ontology.allProps(applicationData.ontology)
      var inputs = []
      var inputMap = {}
      applicationData.predefinedValues = {}
      var predefinedValues = []
      for (var i = 0; i < props.length; i++) {
        var disabled = false
        if (props[ i ][ 'http://data.deichman.no/ui#editable' ] !== undefined && props[ i ][ 'http://data.deichman.no/ui#editable' ] !== true) {
          disabled = true
        }

        // Fetch predefined values, if required
        var predicate = Ontology.resolveURI(applicationData.ontology, props[ i ][ '@id' ])
        var valuesFrom = props[ i ][ 'http://data.deichman.no/utility#valuesFrom' ]
        if (valuesFrom) {
          var url = valuesFrom[ '@id' ]
          predefinedValues.push(loadPredefinedValues(url, props[ i ][ '@id' ]))
        }
        var ranges = props[ i ][ 'rdfs:range' ]
        var datatypes = _.isArray(ranges) ? _.pluck(ranges, '@id') : [ ranges[ '@id' ] ]
        var domains = props[ i ][ 'rdfs:domain' ]
        _.each(domains, function (domain) {
          if (_.isObject(domain)) {
            domain = domain[ '@id' ]
          }
          var predefined = valuesFrom
          var fragment = predicate.substring(predicate.lastIndexOf('#') + 1)
          var input = {
            disabled: disabled,
            predicate: predicate,
            fragment: fragment,
            predefined: predefined,
            ranges: datatypes,
            datatypes: datatypes,
            label: i18nLabelValue(props[ i ][ 'rdfs:label' ]),
            domain: domain,
            allowAddNewButton: false,
            values: emptyValues(predefined),
            dataAutomationId: unPrefix(domain) + '_' + predicate + '_0'
          }

          if (input.predefined) {
            input.type = 'select-predefined-value'
            input.datatype = 'http://www.w3.org/2001/XMLSchema#anyURI'
          } else {
            assignInputTypeFromRange(input)
          }
          inputs.push(input)
          inputMap[ unPrefix(domain) + '.' + input.predicate ] = input
        })
      }
      var inputGroups = []
      var ontologyUri = applicationData.ontology[ '@context' ][ 'deichman' ]

      var createInputForCompoundInput = function (prop, tab, ontologyUri, inputMap) {
        var currentInput = {
          type: 'compound',
          label: prop.label,
          domain: tab.rdfType,
          subjectTypes: prop.subjects,
          subjectType: undefined,
          allowAddNewButton: false,
          subInputs: [],
          predicate: ontologyUri + prop.subInputs.rdfProperty,
          ranges: prop.subInputs.ranges,
          range: prop.subInputs.range,
          inputGroupRequiredVetoes: []
        }
        if (_.isArray(currentInput.subjectTypes) && currentInput.subjectTypes.length === 1) {
          currentInput.subjectType = currentInput.subjectTypes[ 0 ]
        }
        _.each(prop.subInputs.inputs, function (subInput) {
          var inputFromOntology = deepClone(inputMap[ prop.subInputs.range + '.' + ontologyUri + subInput.rdfProperty ])
          assignUniqueValueIds(inputFromOntology)
          var indexTypes = _.isArray(subInput.indexTypes) ? subInput.indexTypes : [ subInput.indexTypes ]
          var type = subInput.type || inputFromOntology.type
          var newSubInput = {
            label: subInput.label,
            input: _.extend(_.clone(inputFromOntology), {
              type: type,
              isSubInput: true,
              parentInput: currentInput,
              indexTypes: indexTypes,
              selectedIndexType: indexTypes.length === 1 ? indexTypes[ 0 ] : undefined,
              indexDocumentFields: subInput.indexDocumentFields,
              nameProperties: subInput.nameProperties,
              dataAutomationId: inputFromOntology.dataAutomationId,
              widgetOptions: subInput.widgetOptions,
              suggestValueFrom: subInput.suggestValueFrom,
              id: subInput.id,
              required: subInput.required
              // ,
              // values: emptyValues(false, type === "searchable-with-result-in-side-panel")
            }),
            parentInput: currentInput
          }

          copyResourceForms(subInput)

          if (type === 'searchable-with-result-in-side-panel') {
            newSubInput.input.values[ 0 ].searchable = true
          }
          currentInput.subInputs.push(newSubInput)
        })
        return currentInput
      }

      function copyResourceForms (input) {
        if (input.widgetOptions) {
          _.each([ 'enableCreateNewResource', 'enableEditResource' ], function (enableAction) {
            if (input.widgetOptions[ enableAction ]) {
              input.widgetOptions[ enableAction ][ 'forms' ] = {}
              _.each(input.widgetOptions[ enableAction ].formRefs, function (formRef) {
                var resourceForm = deepClone(_.find(applicationData.config.inputForms, function (formSpec) {
                  return formSpec.id === formRef.formId
                }))
                _.each(resourceForm.inputs, function (formInput) {
                  var predicate = ontologyUri + formInput.rdfProperty
                  var ontologyInput = inputMap[ resourceForm.rdfType + '.' + predicate ]
                  _.extend(formInput, _.omit(ontologyInput, formInput.type ? 'type' : ''))
                  formInput[ 'values' ] = emptyValues(false)
                  formInput[ 'rdfType' ] = resourceForm.rdfType
                })
                input.widgetOptions[ enableAction ][ 'forms' ][ formRef.targetType ] = {
                  inputs: resourceForm.inputs,
                  rdfType: resourceForm.rdfType,
                  labelForCreateButton: resourceForm.labelForCreateButton
                }
              })
            }
          })
        }
      }

      function createInputsForGroup (inputGroup) {
        var groupInputs = []
        _.each(inputGroup.inputs, function (input, index) {
          var ontologyInput
          if (input.searchMainResource) {
            groupInputs.push({
              label: input.searchMainResource.label,
              values: emptyValues(false, true),
              type: 'searchable-with-result-in-side-panel',
              visible: true,
              indexTypes: [ input.searchMainResource.indexType ],
              selectedIndexType: input.searchMainResource.indexType,
              isMainEntry: true,
              isRoot: input.searchMainResource.isRoot,
              widgetOptions: input.widgetOptions,
              suggestValueFrom: input.suggestValueFrom,
              datatype: input.datatype,
              showOnlyWhenEmpty: input.searchMainResource.showOnlyWhenMissingTargetUri,
              dataAutomationId: input.searchMainResource.automationId,
              inputIndex: index
            })
          } else if (input.searchForValueSuggestions) {
            groupInputs.push({
              label: input.searchForValueSuggestions.label,
              values: emptyValues(false, true),
              type: 'searchable-for-value-suggestions',
              visible: true,
              widgetOptions: input.widgetOptions,
              datatype: input.datatype,
              showOnlyWhenEmpty: input.searchForValueSuggestions.showOnlyWhenMissingTargetUri,
              dataAutomationId: input.searchForValueSuggestions.automationId,
              searchForValueSuggestions: input.searchForValueSuggestions,
              inputIndex: index
            })
          } else {
            input.inputIndex = index
            if (input.rdfProperty) {
              ontologyInput = deepClone(inputMap[ inputGroup.rdfType + '.' + ontologyUri + input.rdfProperty ])
              assignUniqueValueIds(ontologyInput)
              if (typeof ontologyInput === 'undefined') {
                throw new Error("Group '" + inputGroup.id + "' specified unknown property '" + input.rdfProperty + "'")
              }
            } else if (input.subInputs) {
              ontologyInput = createInputForCompoundInput(input, inputGroup, ontologyUri, inputMap)
            } else {
              throw new Error('Input #' + index + " of tab or form with id '" + inputGroup.id + "' must have rdfProperty, subInputs or searchMainResource")
            }

            if (inputGroup.rdfType === unPrefix(ontologyInput.domain)) {
              groupInputs.push(ontologyInput)
              ontologyInput.rdfType = inputGroup.rdfType
            }
            transferInputGroupOptions(input, ontologyInput)
            if (input.widgetOptions) {
              ontologyInput.widgetOptions = input.widgetOptions
            }
            if (input.suggestValueFrom) {
              ontologyInput.suggestValueFrom = input.suggestValueFrom
            }
          }
          copyResourceForms(input)
        })
        return groupInputs
      }

      var configInputsForVisibleGroup = function (inputGroup, index) {
        var group = { groupIndex: index }
        var groupInputs = createInputsForGroup(inputGroup)
        group.inputs = groupInputs
        group.tabLabel = inputGroup.label
        group.tabId = inputGroup.id
        group.tabSelected = false
        group.domain = inputGroup.rdfType

        if (inputGroup.nextStep) {
          group.nextStep = inputGroup.nextStep
        }

        markFirstAndLastInputsInGroup(group)
        inputGroups.push(group)
      }

      _.each(applicationData.config.inputForms, createInputsForGroup)
      _.each(applicationData.config.tabs, configInputsForVisibleGroup)
      applicationData.inputGroups = inputGroups
      applicationData.inputs = inputs
      applicationData.inputMap = inputMap
      applicationData.maintenanceInputs = createInputsForGroup(applicationData.config.authorityMaintenance[ 0 ])
      markFirstAndLastInputsInGroup({ inputs: applicationData.maintenanceInputs })
      return axios.all(predefinedValues).then(function (values) {
        _.each(values, function (predefinedValue) {
          if (predefinedValue) {
            applicationData.predefinedValues[ unPrefix(predefinedValue.property) ] = predefinedValue.values
          }
        })
        return applicationData
      })
    }

    function grandParentOf (keypath) {
      return _.initial(_.initial(keypath.split('.'))).join('.')
    }

    function parentOf (keypath) {
      return _.initial(keypath.split('.')).join('.')
    }

    /* public API */
    function visitInputs (mainInput, visitor) {
      _.each(mainInput.subInputs ? _.pluck(mainInput.subInputs, 'input') : [ mainInput ], visitor)
    }

    function positionSupportPanels () {
      var dummyPanel = $('#right-dummy-panel')
      var supportPanelLeftEdge = dummyPanel.position().left
      var supportPanelWidth = dummyPanel.width()
      $('span.support-panel').each(function (index, panel) {
        var supportPanelBaseId = $(panel).attr('data-support-panel-base-ref')
        var supportPanelBase = $('#' + supportPanelBaseId + ' input')
        if (supportPanelBase.length > 0) {
          $(panel).css({
            top: _.last(_.flatten([ supportPanelBase ])).position().top - 15,
            left: supportPanelLeftEdge,
            width: supportPanelWidth
          })
        }
      })
    }

    function loadWorksAsSubject (target) {
      axios.get(proxyToServices(target.uri + '/asSubjectOfWorks')).then(function (response) {
        target.work = _.pluck(_.pluck(ensureJSON(response).data.hits.hits, '_source'), 'work')
        ractive.update()
      })
    }

    function externalSourceHitDescription (graph) {
      var workGraph = graph.byType('Work')[ 0 ]
      var mainHitLine = []
      var detailsHitLine = []
      var publicationGraph = graph.byType('Publication')[ 0 ]
      mainHitLine = _.map(workGraph.getAll('mainTitle'), function (prop) {
        return prop.value
      })
      detailsHitLine = _.map(publicationGraph.getAll('publicationYear'), function (prop) {
        return prop.value
      })

      _.each(workGraph.outAll('contributor'), function (contributor) {
        if (contributor.isA('deichman:MainEntry')) {
          var agent = contributor.out('agent')
          detailsHitLine.push(agent.get("name").value)
        }
      })
      return {
        main: mainHitLine.join(' - '),
        details: detailsHitLine.join(' - '),
        graph: graph
      }
    }

  function isBlankNodeUri (uri){
      return uri.startsWith('_:')
      }

  var Main = {
      searchResultItemHandlers: {
        defaultItemHandler: function (item) {
          return item
        },
        personItemHandler: function (personItem) {
          personItem.lifeSpan = ''
          if (personItem.birthYear) {
            personItem.lifeSpan += '(' + personItem.birthYear + '–'
            if (personItem.deathYear) {
              personItem.lifeSpan += personItem.deathYear
            }
            personItem.lifeSpan += ')'
          }
          return personItem
        },
        workItemHandler: function (workItem) {
          var author = _.find(workItem.contributors, function (contributor) {
            return contributor.mainEntry
          })
          if (author) {
            var creatorAgent = author.agent
            workItem.creator = creatorAgent.name
            if (creatorAgent.birthYear) {
              workItem.creator += ' (' + creatorAgent.birthYear + '–'
              if (creatorAgent.deathYear) {
                workItem.creator += creatorAgent.deathYear
              }
              workItem.creator += ')'
            }
          }
          return workItem
        }
      },
      getURLParameter: function (name) {
        // http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
        name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]')
        var regexS = '[\\?&]' + name + '=([^&#]*)'
        var regex = new RegExp(regexS)
        var results = regex.exec(location.search)
        return results === null ? null : results[ 1 ]
      },
      patchResourceFromValue: function (subject, predicate, oldAndcurrentValue, datatype, errors, keypath) {
        var patch = Ontology.createPatch(subject, predicate, oldAndcurrentValue, datatype)
        if (patch && patch.trim() !== '' && patch.trim() !== '[]') {
          ractive.set('save_status', 'arbeider...')
          axios.patch(subject, patch, {
            headers: {
              Accept: 'application/ld+json',
              'Content-Type': 'application/ldpatch+json'
            }
          })
            .then(function (response) {
              // successfully patched resource
              updateInputsForResource(response, subject, { keepDocumentUrl: true })

              // keep the value in current.old - so we can do create delete triple patches later
              if (keypath) {
                var cur = ractive.get(keypath + '.current')
                if (cur) {
                  ractive.set(keypath + '.old.value', cur.value)
                  ractive.set(keypath + '.old.lang', cur.lang)
                }
              }
              ractive.set('save_status', 'alle endringer er lagret')
              ractive.update()
            })
          // .catch(function (response) {
          //    // failed to patch resource
          //    console.log("HTTP PATCH failed with: ")
          //    errors.push("Noe gikk galt! Fikk ikke lagret endringene")
          //    ractive.set("save_status", "")
          // })
        }
      },
      predefinedLabelValue: function (type, uri) {
        return i18nLabelValue(_.find(ractive.get('predefinedValues.' + type), function (predefinedValue) {
          return predefinedValue[ '@id' ] === uri
        })[ 'rdfs:label' ])
      },

      init: function (template) {
        var query = URI.parseQuery(URI.parse(document.location.href).query)
        template = '/templates/' + (query.template || template || 'menu') + '.html'
        var partials = [
          'input',
          'input-string',
          'input-string-large',
          'input-lang-string',
          'input-gYear',
          'input-nonNegativeInteger',
          'searchable-with-result-in-side-panel',
          'support-for-searchable-with-result-in-side-panel',
          'searchable-authority-dropdown',
          'searchable-for-value-suggestions',
          'suggested-values',
          'suggestor-for-searchable-with-result-in-side-panel',
          'suggestor-for-select-predefined-value',
          'suggestor-for-input-string',
          'suggestor-for-input-gYear',
          'suggestor-for-input-nonNegativeInteger',
          'suggestor-for-input-literal',
          'select-predefined-value',
          'work'
        ]
        // window.onerror = function (message, url, line) {
        //    // Log any uncaught exceptions to assist debugging tests.
        //    // TODO remove this when everything works perfectly (as if...)
        //    console.log('ERROR: "' + message + '" in file: ' + url + ', line: ' + line)
        // }

        // axios and phantomjs needs a Promise polyfill, so we use the one provided by ractive.
        if (window && !window.Promise) {
          window.Promise = Ractive.Promise
        }

        var errors = []

        // Start initializing - return a Promise
        var loadTemplate = function (applicationData) {
          return axios.get(template).then(
            function (response) {
              applicationData.template = response.data
              return applicationData
            })
        }

        var loadPartials = function (applicationData) {
          return Promise.all(_.map(partials, function (partial) {
            return axios.get('/partials/' + partial + '.html').then(
              function (response) {
                applicationData.partials = applicationData.partials || {}
                applicationData.partials[ partial ] = response.data
                return applicationData
              }).catch(function (error) {
              throw new Error(error)
            })
          })).then(function (applicationDataArray) {
            return applicationDataArray[ 0 ]
          })
        }

        var extractConfig = function (response) {
          return { config: ensureJSON(response.data) }
        }

        function patchObject (input, applicationData, index, operation) {
          var patch = []
          var actualSubjectType = _.first(input.subInputs).input.values[ index ].subjectType || input.subjectType || input.rdfType
          var mainSubject = ractive.get('targetUri.' + actualSubjectType)
          patch.push({
            op: operation,
            s: mainSubject,
            p: input.predicate,
            o: {
              value: '_:b0',
              type: 'http://www.w3.org/2001/XMLSchema#anyURI'
            }
          })
          if (input.range) {
            patch.push({
              op: operation,
              s: '_:b0',
              p: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              o: {
                value: applicationData.ontology[ '@context' ][ 'deichman' ] + input.range,
                type: 'http://www.w3.org/2001/XMLSchema#anyURI'
              }
            })
          }
          _.each(input.subInputs, function (subInput) {
            var value = subInput.input.values[ index ].current.value
            patch.push({
              op: operation,
              s: '_:b0',
              p: subInput.input.predicate,
              o: {
                value: _.isArray(value) ? value[ 0 ] : value,
                type: subInput.input.datatype
              }
            })
          })
          if (input.isMainEntry) {
            patch.push({
              op: operation,
              s: '_:b0',
              p: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              o: {
                value: applicationData.ontology[ '@context' ][ 'deichman' ] + 'MainEntry',
                type: 'http://www.w3.org/2001/XMLSchema#anyURI'
              }
            })
          }
          ractive.set('save_status', 'arbeider...')
          return axios.patch(mainSubject, JSON.stringify(patch), {
            headers: {
              Accept: 'application/ld+json',
              'Content-Type': 'application/ldpatch+json'
            }
          })
            .then(function (response) {
              // successfully patched resource
              ractive.set('save_status', 'alle endringer er lagret')
            })
          // .catch(function (response) {
          //    // failed to patch resource
          //    console.log("HTTP PATCH failed with: ")
          //    errors.push("Noe gikk galt! Fikk ikke lagret endringene")
          //    ractive.set("save_status", "")
          // })
        }

        var initRactive = function (applicationData) {
          Ractive.decorators.select2.type.singleSelect = function (node) {
            return {
              maximumSelectionLength: 1
            }
          }

          Ractive.decorators.select2.type.authoritySelectSingle = function (node) {
            var inputDef = ractive.get(grandParentOf(Ractive.getNodeInfo(node).keypath))
            if (_.isArray(inputDef.indexTypes) && inputDef.indexTypes.length > 1) {
              throw new Error('searchable-authority-dropdown supports only supports singe indexType')
            }
            var indexType = _.isArray(inputDef.indexTypes) ? inputDef.indexTypes[ 0 ] : inputDef.indexTypes
            var config = ractive.get('config')
            return {
              maximumSelectionLength: 1,
              minimumInputLength: 3,
              ajax: {
                url: config.resourceApiUri + 'search/' + indexType + '/_search',
                dataType: 'json',
                delay: 250,
                id: function (item) {
                  return item._source.person.uri
                },
                data: function (params) {
                  return {
                    q: params.term + '*', // search term
                    page: params.page
                  }
                },
                processResults: function (data, params) {
                  params.page = params.page || 1

                  var select2Data = $.map(data.hits.hits, function (obj) {
                    obj.id = obj._source[ indexType ].uri
                    obj.text = _.map(inputDef.indexDocumentFields, function (field) {
                      return obj._source[ indexType ][ field ]
                    }).join(' - ')
                    return obj
                  })

                  return {
                    results: select2Data,
                    pagination: {
                      more: (params.page * 30) < data.total_count
                    }
                  }
                },
                cache: true
              },
              templateSelection: function (data) {
                return data.text === '' ? ractive.get('authorityLabels[' + data.id + ']') : data.text
              }
            }
          }

          // decorators
          var repositionSupportPanel = function (node) {
            Main.repositionSupportPanelsHorizontally()
            return {
              teardown: function () {}
            }
          }
          var detectChange = function (node) {
            var enableChange = false
            var changeType = null
            $(node).on('select2:selecting select2:unselecting', function (event) {
              enableChange = true
              changeType = event.type
            })
            $(node).on('change', function (e) {
              if (enableChange) {
                enableChange = false
                var inputValue = Ractive.getNodeInfo(e.target)
                var keypath = inputValue.keypath
                ractive.set(keypath + '.current.value', changeType === 'select2:unselecting' ? [] : $(e.target).val())
                if (changeType === 'select2:unselecting') {
                  $(e.target).select2('val', '')
                }
                var inputNode = ractive.get(grandParentOf(keypath))
                if (!inputNode.isSubInput && keypath.indexOf("enableCreateNewResource") === -1) {
                  Main.patchResourceFromValue(ractive.get('targetUri.' + unPrefix(inputNode.domain)), inputNode.predicate,
                    ractive.get(keypath), inputNode.datatype, errors, keypath)
                }
                changeType = null
              }
            })
            return {
              teardown: function () {}
            }
          }
          var handleAddNewBySelect2 = function (node) {
            var inputKeyPath = grandParentOf(Ractive.getNodeInfo(node).keypath)
            ractive.set(inputKeyPath + '.allowAddNewButton', false)
            ractive.set(inputKeyPath + '.addNewHandledBySelect2', true)
            return {
              teardown: function () {}
            }
          }
          var clickOutsideSupportPanelDetector = function (node) {
            $(document).click(function (event) {
              var inputDef = ractive.get(grandParentOf(Ractive.getNodeInfo(node).keypath))
              var targetIsInsideSupportPanel = $(event.target).closest('span.support-panel').length
              var targetIsSupportPanel = $(event.target).is('span.support-panel')
              var targetIsASupportPanelButton = $(event.target).is('.support-panel-button')

              var targetIsARadioButtonThatWasOffButIsOnNow = $(event.target).is("input[type='radio'][value='on']")
              var targetIsASelect2RemoveSelectionCross = $(event.target).is('span.select2-selection__choice__remove') && !$(event.target).is('.overrride-outside-detect')
              if (!(targetIsInsideSupportPanel || targetIsARadioButtonThatWasOffButIsOnNow || targetIsSupportPanel || targetIsASupportPanelButton || targetIsASelect2RemoveSelectionCross)) {
                clearSupportPanels({ keep: [ 'enableCreateNewResource' ] })
                clearMaintenanceInputs()
              }
            })
            return {
              teardown: function () {}
            }
          }

          // Initialize ractive component from template
          ractive = new Ractive({
            el: 'container',
            lang: 'no',
            template: applicationData.template,
            data: {
              applicationData: applicationData,
              predefinedValues: applicationData.predefinedValues,
              errors: errors,
              resource_type: '',
              resource_label: '',
              ontology: null,
              config: applicationData.config,
              save_status: 'ny ressurs',
              authorityLabels: {},
              getAuthorityLabel: function (uri) {
                return ractive.get('authorityLabels')[ uri ]
              },
              urlEscape: function (url) {
                return url.replace(/[:\/\.]/g, '_')
              },
              isSelected: function (option, value) {
                return option[ '@id' ].contains(value) ? "selected='selected'" : ''
              },
              getRdfsLabelValue: function (label) {
                return i18nLabelValue(label)
              },
              tabEnabled: function (tabSelected, domainType) {
                return tabSelected === true || (typeof ractive.get('targetUri.' + domainType) === 'string')
              },
              nextStepEnabled: function (domainType) {
                return true // !(domainType === 'Work')
              },
              readyToAddRole: function (node) {
                return true
              },
              spy: function (node) {
                console.log('spy: ' + node.keypath)
              },
              predefinedLabelValue: Main.predefinedLabelValue,
              publicationId: function () {
                var publicationIdInput = _.find(ractive.get('inputs'), function (input) {
                  return input.predicate.indexOf('#recordID') !== -1
                })
                if (publicationIdInput) {
                  return _.first(publicationIdInput.values).current.value
                }
              },
              inPreferredLanguage: function (text) {
                if (typeof text === 'string') {
                  return text
                } else {
                  var preferredTexts = _.compact([
                    _.find(text, function (value, lang) {
                      return lang === 'nb'
                    }), _.find(text, function (value, lang) {
                      return lang === 'nn'
                    }), _.find(text, function (value, lang) {
                      return lang === 'default'
                    }), _.find(text, function () {
                      return true
                    }) ])
                  return _.first(preferredTexts)
                }
              },
              subjectTypeLabel: function (subject) {
                var resourceLabel = Ontology.resourceLabel(applicationData.ontology, subject, 'no')
                return resourceLabel || ''
              },
              subjectTypeLabelDet: function (subjectType) {
                switch (subjectType) {
                  case 'Work':
                    return 'verket'
                  case 'Publication':
                    return 'utgivelsen'
                  default:
                    return subjectType
                }
              },
              resourceIsLoaded: function (type) {
                return typeof ractive.get('targetUri.' + type) !== 'undefined'
              },
              getSearchResultItemLabel: function (item, itemLabelProperties) {
                return _.compact(_.values(_.pick(item, itemLabelProperties))).join(" - ")
              },
              tabIdFromDocumentUrl: function () {
                var uri = URI.parse(document.location.href)
                var queryParameters = URI.parseQuery(uri.query)
                return queryParameters.openTab || 0
              },
              unacceptedSuggestions: function(input) {
                return _.find(input.subInputs[0].input.values, function (value) {
                  return value.suggested  && value.suggested !== null
                })
              },
              targetResources: {
                Work: {
                  uri: '',
                  pendingProperties: []
                },
                Person: {
                  uri: '',
                  pendingProperties: []
                },
                Publication: {
                  uri: '',
                  pendingProperties: []
                }
              }
            },
            decorators: {
              multi: require('ractive-multi-decorator'),
              repositionSupportPanel: repositionSupportPanel,
              detectChange: detectChange,
              handleAddNewBySelect2: handleAddNewBySelect2,
              clickOutsideSupportPanelDetector: clickOutsideSupportPanelDetector
            },
            partials: applicationData.partials
          })
          ractive.on({
              updateBrowserLocationWithTab: function (event, tabId) {
                updateBrowserLocationWithTab(tabId)
              },
              // addValue adds another input field for the predicate.
              addValue: function (event) {
                var mainInput = ractive.get(event.keypath)
                visitInputs(mainInput, function (input, index) {
                  var length = input.values.length
                  input.values[ length ] = {
                    old: { value: '', lang: '' },
                    current: { value: '', lang: '' },
                    uniqueId: _.uniqueId(),
                    searchable: input.type === 'searchable-with-result-in-side-panel',
                    searchResult: null
                  }
                  if (index === 0) {
                    input.values[ length ].subjectType = null
                  }
                })
                ractive.update()
                ractive.set(event.keypath + '.allowAddNewButton', false)
                positionSupportPanels()
              },
              // patchResource creates a patch request based on previous and current value of
              // input field, and sends this to the backend.
              patchResource: function (event, predicate, rdfType, clearProperty) {
                var input = ractive.get(grandParentOf(event.keypath))
                if (!input.isSubInput) {
                  var inputValue = event.context
                  if (inputValue.error || (inputValue.current.value === '' && inputValue.old.value === '')) {
                    return
                  }
                  var datatypeKeypath = grandParentOf(event.keypath) + '.datatype'
                  var subject = ractive.get('targetUri.' + rdfType)
                  if (subject) {
                    Main.patchResourceFromValue(subject, predicate, inputValue, ractive.get(datatypeKeypath), errors, event.keypath)
                    event.context.domain = rdfType
                    input.allowAddNewButton = true
                  }
                  if (clearProperty) {
                    ractive.set(grandParentOf(event.keypath) + '.' + clearProperty, null)
                  }
                  ractive.update()
                }
              },
              saveObject: function (event, index) {
                var input = event.context
                patchObject(input, applicationData, index, 'add').then(function () {
                  visitInputs(input, function (input) {
                    if (input.isSubInput) {
                      _.each(input.values, function (value, valueIdex) {
                        if (valueIdex === index) {
                          value.nonEditable = true
                        }
                      })
                    }
                  })
                  input.allowAddNewButton = true
                  ractive.update()
                  var subInputs = grandParentOf(event.keypath)
                  _.each(event.context.subInputs, function (input, subInputIndex) {
                    if (_.contains([ 'select-authorized-value', 'entity', 'searchable-authority-dropdown' ], input.input.type)) {
                      var valuesKeypath = subInputs + '.' + subInputIndex + '.input.values.' + index + '.current.value.0'
                      loadLabelsForAuthorizedValues([ ractive.get(valuesKeypath) ], input.input, index)
                    }
                  })
                })
              },
              deleteObject: function (event, parentInput, index) {
                patchObject(parentInput, applicationData, index, 'del').then(function () {
                  var subInputs = grandParentOf(grandParentOf(event.keypath))
                  _.each(parentInput.subInputs, function (input, subInputIndex) {
                    ractive.get(subInputs + '.' + subInputIndex + '.input.values').splice(index, 1)
                  })
                  ractive.update()
                  if (ractive.get(subInputs + '.0.input.values').length === 0) {
                    var addValueEvent = { keypath: parentOf(subInputs) }
                    ractive.fire('addValue', addValueEvent)
                  }
                })
              },
              searchResource: function (event, searchString, indexType, loadWorksAsSubjectOfItem) {
                var inputkeyPath = grandParentOf(event.keypath)
                if (!searchString) {
                  if (ractive.get(event.keypath + ".searchResult.")) {
                    ractive.set(event.keypath + ".searchResult.", null)
                  }
                } else {
                  var searchBody
                  var config = ractive.get('config')
                  var axiosMethod
                  if (config.search[ indexType ].structuredQuery) {
                    axiosMethod = axios.post
                    var filters = {
                      personAsMainEntryFilter: function (filterArg) {
                        return {
                          nested: {
                            path: "work.contributors",
                            query: {
                              bool: {
                                filter: [
                                  {
                                    term: {
                                      "work.contributors.mainEntry": true
                                    }
                                  },
                                  {
                                    nested: {
                                      path: "work.contributors.agent",
                                      query: {
                                        term: {
                                          "work.contributors.agent.uri": filterArg
                                        }
                                      }
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        }
                      },
                      default: function () {
                        return {}
                      }
                    }
                    var filterArg = null
                    var filterArgInputRef = ractive.get(inputkeyPath + '.widgetOptions.filter.inputRef')
                    if (filterArgInputRef) {
                      filterArg = _.find(allInputs(), function (input) {
                        return filterArgInputRef === input.id
                      }).values[ 0 ].current.value
                    }
                    if (isBlankNodeUri(filterArg)) {
                      filterArg = undefined
                    }

                    var matchBody = {}
                    matchBody[ config.search[ indexType ].queryTerm ] = {
                      query: searchString,
                      operator: 'and'
                    }

                    var filterName = filterArg ? ractive.get(inputkeyPath + '.widgetOptions.filter.name') || 'default' : 'default'

                    searchBody = {
                      "query": {
                        "bool": {
                          "filter": [
                            {
                              "match": matchBody
                            }, filters[ filterName ](filterArg)
                          ]
                        }
                      }
                    }
                  } else {
                    axiosMethod = axios.get
                    searchBody = {
                      params: {
                        q: config.search[ indexType ].queryTerm + ':' + searchString + '*'
                      }
                    }
                  }
                  var searchURI = config.resourceApiUri + 'search/' + indexType + '/_search'

                  axiosMethod(searchURI, searchBody)
                    .then(function (response) {
                      var results = ensureJSON(response.data)
                      results.hits.hits.forEach(function (hit) {
                        var item = hit._source[ indexType ]
                        item.isChecked = false
                        if (loadWorksAsSubjectOfItem) {
                          item.work = null
                        }
                        if (item.work) {
                          if (!_.isArray(item.work)) {
                            item.work = [ item.work ]
                          }
                          _.each(item.work, function (work) {
                            work.isChecked = false
                          })
                        }
                      })
                      ractive.set(event.keypath + '.searchResult', {
                        items: _.map(_.pluck(_.pluck(results.hits.hits, '_source'), indexType),
                          Main.searchResultItemHandlers[ config.search[ indexType ].itemHandler || 'defaultItemHandler' ]),
                        origin: event.keypath,
                        searchTerm: searchString
                      })
                      positionSupportPanels()
                    })
                  //    .catch(function (err) {
                  //    console.log(err)
                  // })
                }
              },
              searchResourceFromSuggestion: function (event, searchString, indexType, loadWorksAsSubjectOfItem) {
                var inputkeyPath = grandParentOf(event.keypath)
                ractive.fire('searchResource', { keypath: grandParentOf(event.keypath) + '.values.0' }, searchString, indexType, loadWorksAsSubjectOfItem)
              },
              toggleWork: function (event, findWorksAsSubjectOfType, origin) {
                var keypath = event.keypath + '.toggleWork'
                ractive.get(keypath) !== true ? ractive.set(keypath, true) : ractive.set(keypath, false)
                if (findWorksAsSubjectOfType && !origin.work) {
                  loadWorksAsSubject(origin)
                }
              },
              selectSearchableItem: function (event, origin, displayValue) {
                ractive.set(origin + ".searchResult", null)
                var inputKeyPath = grandParentOf(origin)
                var input = ractive.get(inputKeyPath)
                var uri = event.context.uri
                if (ractive.get(inputKeyPath + '.widgetOptions.enableInPlaceEditing')) {
                  var indexType = ractive.get(inputKeyPath + '.indexTypes.0')
                  var rdfType = ractive.get(inputKeyPath + '.widgetOptions.enableEditResource.forms.' + indexType)
                  unloadResourceForDomain(rdfType)
                  fetchExistingResource(uri, { keepDocumentUrl: true })
                  ractive.set(inputKeyPath + '.widgetOptions.enableEditResource.showInputs', true)
                } else if (input.isMainEntry) {
                  fetchExistingResource(uri)
                } else {
                  ractive.set(origin + '.old.value', ractive.get(origin + '.current.value'))
                  ractive.set(origin + '.current.value', uri)
                  ractive.set(origin + '.current.displayValue', displayValue)
                  ractive.set(origin + '.deletable', true)
                  ractive.set(origin + '.searchable', false)
                  _.each(input.dependentResourceTypes, function (resourceType) {
                    unloadResourceForDomain(resourceType)
                  })
                  if (!input.isSubInput && ractive.get('targetUri.' + unPrefix(input.domain))) {
                    ractive.fire('patchResource',
                      { keypath: origin, context: ractive.get(origin) },
                      ractive.get(grandParentOf(origin)).predicate,
                      unPrefix(input.domain))
                  }
                  ractive.set(origin + '.searchResult', null)
                }
              },
              selectWorkResource: function (event) {
                var uri = event.context.uri
                unloadResourceForDomain('Publication')
                fetchExistingResource(uri)
              },
              setResourceAndWorkResource: function (event, mainItem, origin, domainType) {
                ractive.fire('selectSearchableItem', {
                  context: {
                    uri: mainItem.uri
                  }
                }, origin, mainItem.name)
                ractive.fire('selectWorkResource', { context: event.context })
              },
              unselectEntity: function (event) {
                ractive.set(event.keypath + '.searchResult', null)
                ractive.set(event.keypath + '.current.value', '')
                ractive.set(event.keypath + '.current.displayValue', '')
                ractive.set(event.keypath + '.deletable', false)
                ractive.set(event.keypath + '.searchable', true)
                var input = ractive.get(grandParentOf(event.keypath))
                ractive.fire('patchResource', event, input.predicate, input.subjectType)
                if (ractive.get(parentOf(event.keypath)).length > 1) {
                  ractive.splice(parentOf(event.keypath), _.last(event.keypath.split('.')), 1)
                }
                if (input.isMainEntry) {
                  unloadResourceForDomain('Work')
                  unloadResourceForDomain('Person')
                }
              },
              activateTab: function (event) {
                _.each(ractive.get('inputGroups'), function (group, groupIndex) {
                  var keyPath = 'inputGroups.' + groupIndex
                  ractive.set(keyPath + '.tabSelected', keyPath === event.keypath)
                })
                positionSupportPanels()
              },
              nextStep: function (event) {
                if (event.context.restart) {
                  var url = URI.parse(document.location.href)
                  url.query = {}
                  window.location.replace(URI.build(url))
                }
                var newResourceType = event.context.createNewResource
                if (newResourceType && (!ractive.get('targetUri.' + newResourceType))) {
                  _.each(_.keys(newResourceType.prefillValuesFromResource), function (copyFromType) {
                    _.each(newResourceType.prefillValuesFromResource[ copyFromType ], function (fragment) {
                      var inputs = allInputs()
                      var sourceInput = _.find(inputs, function (input) {
                        return (input.fragment === fragment && unPrefix(input.domain) === copyFromType)
                      })
                      if (sourceInput) {
                        var targetInput = _.find(inputs, function (input) {
                          return (input.fragment === fragment && unPrefix(input.domain) === newResourceType.type)
                        })
                        if (targetInput) {
                          targetInput.values = deepClone(sourceInput.values)
                          targetInput.datatype = sourceInput.datatype
                        }
                      }
                    })
                  })
                  saveNewResourceFromInputs(newResourceType.type)
                  ractive.update();
                }
                var foundSelectedTab = false
                _.each(ractive.get('inputGroups'), function (group, groupIndex) {
                  var keyPath = 'inputGroups.' + groupIndex
                  if (foundSelectedTab) {
                    ractive.set(keyPath + '.tabSelected', true)
                    foundSelectedTab = false
                  } else {
                    if (ractive.get(keyPath + '.tabSelected')) {
                      foundSelectedTab = true
                    }
                    ractive.set(keyPath + '.tabSelected', false)
                  }
                })
              },
              showCreateNewResource: function (event, origin) {
                ractive.set(origin + ".searchResult.hidden", true)
                var searchTerm = ractive.get(origin + ".searchResult.searchTerm")
                if (searchTerm) {
                  _.each(event.context.inputs, function (input) {
                    if (input.preFillFromSearchField) {
                      input.values[ 0 ].current.value = searchTerm
                      ractive.update()
                    }
                  })
                }
                ractive.set(grandParentOf(event.keypath) + '.showInputs', true)
              },
              createNewResource: function (event, origin) {
                var maintenance = origin.indexOf("maintenanceInputs") != -1
                var displayValueInput = _.find(event.context.inputs, function (input) {
                  return input.displayValueSource === true
                })
                var useAfterCreation = ractive.get(grandParentOf(event.keypath)).useAfterCreation

                var setCreatedResourceUriInSearchInput = function (resourceUri) {
                  if (!maintenance) {
                    ractive.set(origin + '.current.value', resourceUri)
                    if (displayValueInput) {
                      ractive.set(origin + '.current.displayValue', displayValueInput.values[ 0 ].current.value)
                    }
                    ractive.set(origin + '.deletable', true)
                    ractive.set(origin + '.searchable', false)
                    ractive.set(event.keypath + '.visible', null)
                  } else {
                    ractive.set(origin + '.current.value', null)
                    if (displayValueInput) {
                      ractive.set(origin + '.current.displayValue', null)
                    }
                  }
                  ractive.set(grandParentOf(event.keypath) + '.showInputs', null)
                  return resourceUri
                }
                var patchMotherResource = function (resourceUri) {
                  var targetInput = ractive.get(grandParentOf(origin));
                  if (!useAfterCreation && !targetInput.isSubInput) {
                    Main.patchResourceFromValue(ractive.get("targetUri." + targetInput.rdfType), targetInput.predicate, ractive.get(origin), targetInput.datatype, errors)
                  }
                  return resourceUri
                }
                var setCreatedResourceValuesInInputs = function (resourceUri) {
                  if (useAfterCreation) {
                    ractive.set('targetUri.' + event.context.rdfType, resourceUri)
                    var groupInputs = ractive.get('inputGroups')
                    _.each(event.context.inputs, function (input) {
                      _.each(groupInputs, function (group) {
                        _.each(group.inputs, function (groupInput) {
                          if (groupInput.predicate === input.predicate && groupInput.rdfType === input.rdfType) {
                            groupInput.values = deepClone(input.values)
                          }
                        })
                      })
                    })
                    ractive.update()
                    updateBrowserLocationWithUri(event.context.rdfType, resourceUri)
                  }
                  return resourceUri
                }
                var clearInputsAndSearchResult = function () {
                  if (ractive.get(origin + '.searchResult')) {
                    ractive.set(origin + '.searchResult', null)
                  }
                  _.each(event.context.inputs, function (input, index) {
                    ractive.set(event.keypath + '.inputs.' + index + '.values', emptyValues(false))
                  })
                  ractive.set(event.keypath + '.showInputs', false)
                  ractive.set(grandParentOf(origin) + '.allowAddNewButton', true)
                }
                var nop = function (uri) {
                  return uri
                }
                saveInputs(event.context.inputs, event.context.rdfType)
                  .then(setCreatedResourceUriInSearchInput)
                  .then(!maintenance ? patchMotherResource : nop)
                  .then(!maintenance ? setCreatedResourceValuesInInputs : nop)
                  .then(clearInputsAndSearchResult)
              },
              cancelEdit: function (event) {
                clearSupportPanels();
                ractive.set(grandParentOf(event.keypath) + '.showInputs', null)
              },
              fetchValueSuggestions: function (event) {
                var searchExternalSourceInput = ractive.get(grandParentOf(event.keypath))
                searchExternalSourceInput.searchForValueSuggestions.hitsFromPreferredSource = []
                searchExternalSourceInput.searchForValueSuggestions.valuesFromPreferredSource = []
                _.each(allInputs(), function (input) {
                  input.suggestedValues = null;
                })
                ractive.update()
                _.each(searchExternalSourceInput.searchForValueSuggestions.sources, function (source) {
                  axios.get('/valueSuggestions/' + source + '/' + event.context.current.value).then(function (response) {
                    var fromPreferredSource = response.data.source === searchExternalSourceInput.searchForValueSuggestions.preferredSource.id
                    var hitsFromPreferredSource = { source: response.data.source, items: [] }
                    _.each(response.data.hits, function (hit) {
                      var graph = ldGraph.parse(hit)
                      if (fromPreferredSource) {
                        hitsFromPreferredSource.items.push(externalSourceHitDescription(graph))
                      } else {
                        _.each([ 'Work', 'Publication' ], function (domain) {
                          updateInputsForResource({ data: {} }, null, {
                            keepDocumentUrl: true,
                            onlyValueSuggestions: true,
                            source: response.data.source
                          }, graph.byType(domain)[ 0 ], domain)
                        })
                      }
                    })
                    if (fromPreferredSource) {
                      searchExternalSourceInput.searchForValueSuggestions.hitsFromPreferredSource.push(hitsFromPreferredSource)
                    }
                    ractive.update();
                  })
                })
              },
              acceptSuggestedPredefinedValue: function (event, value) {
                var input = ractive.get(grandParentOf(event.keypath))
                if (!input.multiple) {
                  setSingleValue(value, input, 0, { isNew: true })
                } else {
                  var oldValues = _.map(input.values[0].current.value, function (value) {
                    return {id: value}
                  })
                  oldValues.push({id: value.value})
                  setMultiValues(oldValues, input, 0)
                }
                ractive.update()
                ractive.fire('patchResource',
                  { keypath: grandParentOf(event.keypath) + '.values.0', context: input.values[ 0 ] },
                  input.predicate,
                  unPrefix(input.domain))
              },
              acceptSuggestedLiteralValue: function (event, value) {
                var input = ractive.get(grandParentOf(event.keypath))
                if (!input.multiple) {
                  setSingleValue(value, input, 0, { isNew: true })
                } else {
                  var oldValues = input.values
                  setSingleValue(value, input, oldValues.length, { isNew: true })
                }
                ractive.update()
                ractive.fire('patchResource',
                  { keypath: grandParentOf(event.keypath) + '.values.' + (oldValues.length - 1), context: input.values[ oldValues.length - 1 ] },
                  input.predicate,
                  unPrefix(input.domain))
              },
              acceptExternalItem: function (event) {
                var inputsWithValueSuggestionEnabled = _.filter(allInputs(), function (input) {
                    return input.suggestValueFrom
                  }
                )

                _.each([ 'Work', 'Publication' ], function (domain) {
                  var node = event.context.graph.byType(domain)[ 0 ]
                  updateInputsForResource({ data: {} }, null, { keepDocumentUrl: true }, node, domain)
                  _.each(inputsWithValueSuggestionEnabled, function (input) {
                    if (input.suggestValueFrom.domain === domain) {
                      input.values = input.values || [ { current: {} } ]
                      _.each(node.getAll(propertyName(input.suggestValueFrom.predicate)), function (value, index) {input.values[ index ].current.displayValue = value.value})
                    }
                  })
                })
                ractive.set("primarySuggestionAccepted", true)
                ractive.update()
              },
              useSuggestion: function (event) {
                event.context.suggested = null;
                event.context.keepOrder = true
                ractive.update()
              }
            }
          )

          function castVetoForRequiredSubInput (inputGroupKeypath, valueIndex, voter, veto) {
            var vetoesKeyPath = inputGroupKeypath + '.inputGroupRequiredVetoes.' + valueIndex
            var inputGroupRequiredVetoes = (ractive.get(vetoesKeyPath) || '').split('')
            if (veto) {
              inputGroupRequiredVetoes = _.union(inputGroupRequiredVetoes, [ voter ])
            } else {
              inputGroupRequiredVetoes = _.difference(inputGroupRequiredVetoes, [ voter ])
            }
            ractive.set(vetoesKeyPath, inputGroupRequiredVetoes.join(''))
          }

          function checkRequiredSubjectTypeSelection (keypath, newValue) {
            var valueIndex = _.last(parentOf(keypath).split('.'))
            var inputKeypath = parentOf(grandParentOf(keypath))
            var inputGroupKeypath = parentOf(grandParentOf(inputKeypath))
            var input = ractive.get(inputKeypath)
            if (input.required && _.isArray(input.subjectTypes) && input.subjectTypes.length < 2) {
              var veto = newValue === undefined || newValue === null
              castVetoForRequiredSubInput(inputGroupKeypath, valueIndex, '*', veto)
            }
          }

          function checkRequiredSubInput (newValue, keypath) {
            newValue = _.flatten([ newValue ]).join('')
            var valueIndex = _.last(grandParentOf(keypath).split('.'))
            var inputKeypath = grandParentOf(grandParentOf(keypath))
            var inputGroupKeypath = parentOf(grandParentOf(inputKeypath))
            var input = ractive.get(inputKeypath)
            if (input.required) {
              var voter = _.last(parentOf(grandParentOf(grandParentOf(keypath))).split('.'))
              var veto = !(typeof newValue === 'string' && newValue.length > 0)
                || (input.type === 'searchable-with-result-in-side-panel' && typeof newValue === 'string' && isBlankNodeUri(newValue))
              castVetoForRequiredSubInput(inputGroupKeypath, valueIndex, voter, veto)
            }
          }

          ractive.observe('inputGroups.*.inputs.*.subInputs.0.input.values.*.subjectType', function (newValue, oldValue, keypath) {
            checkRequiredSubjectTypeSelection(keypath, newValue)
          })

          ractive.observe('inputGroups.*.inputs.*.subInputs.*.input.values.*.current.value', function (newValue, oldValue, keypath) {
            checkRequiredSubInput(newValue, keypath)
          })

          ractive.observe('inputGroups.*.inputs.*.values.*', function (newValue, oldValue, keypath) {
            if (newValue && newValue.current) {
              if (!newValue.current.value) {
                ractive.set(keypath + '.error', false)
                return
              }
              var parent = grandParentOf(keypath)
              let uri = newValue.current.value[ 0 ]
              if (typeof uri === 'string') {
                var predicate = ractive.get(parent + '.predicate')
                if (predicate && predicate.indexOf('publicationOf') !== -1 && ractive.get('targetUri.Work') !== uri && !isBlankNodeUri(uri)) {
                  fetchExistingResource(uri)
                }
              }
              var valid = false
              try {
                valid = Ontology.validateLiteral(newValue.current.value, ractive.get(parent).range)
              } catch (e) {
                console.log(e)
                return
              }
              if (valid) {
                ractive.set(keypath + '.error', false)
              } else {
                ractive.set(keypath + '.error', 'ugyldig input')
              }
            }
          })

          ractive.observe('targetUri.Work', function (newValue, oldValue, keypath) {
            _.each(allInputs(), function (input, inputIndex) {
              if (input.predicate && input.predicate.indexOf('#publicationOf') !== -1) {
                input.values = [
                  {
                    current: {
                      value: [ newValue ]
                    }
                  }
                ]
                // ractive.set('inputs.' + inputIndex + '.values.0.current.value', newValue)
                // ractive.set('inputs.' + inputIndex + '.values.0.old.value', '')
              }
            })
            ractive.update()
          })

          ractive.observe('inputGroups.*.tabSelected', function (newValue, oldValue, keypath) {
            if (newValue === true) {
              updateBrowserLocationWithTab(keypath.split('.')[ 1 ])
            }
          })

          function getParentFromKeypath (keypath, parentLevels) {
            parentLevels = parentLevels || 1
            var split = keypath.split('.')
            return split.splice(0, split.length - parentLevels).join('.')
          }

          ractive.set('inputGroups', applicationData.inputGroups)
          ractive.set('inputs', applicationData.inputs)
          ractive.set('predefinedValues', applicationData.predefinedValues)
          ractive.update()
          return applicationData
        }

        var loadOntology = function (applicationData) {
          return axios.get(applicationData.config.ontologyUri)
            .then(function (response) {
              applicationData.ontology = ensureJSON(response.data)
              return applicationData
            })
        }

        function initSelect2 (applicationData) {
          require('select2')
          $.fn.select2.defaults.set('language', {
            inputTooLong: function (args) {
              var overChars = args.input.length - args.maximum

              return 'Vennligst fjern ' + overChars + ' tegn'
            },
            inputTooShort: function (args) {
              var remainingChars = args.minimum - args.input.length
              var message = 'Vennligst skriv inn '
              if (remainingChars > 1) {
                message += ' flere tegn'
              } else {
                message += ' tegn til'
              }
              return message
            },
            loadingMore: function () {
              return 'Laster flere resultater…'
            },
            maximumSelected: function (args) {
              if (args.maximum === 1) {
                return 'Du kan bare velge én verdi her'
              } else {
                return 'Du kan velge maks ' + args.maximum + ' verdier her'
              }
            },
            noResults: function () {
              return 'Ingen treff'
            },
            searching: function () {
              return 'Søker…'
            }
          })
          require('ractive-decorators-select2')
          return applicationData
        }

        function loadWorkOfPublication () {
          var publicationOfInput = _.find(ractive.get('inputs'), function (input) {
            return (input.fragment === 'publicationOf')
          })
          if (publicationOfInput) {
            var workUri = publicationOfInput.values[ 0 ].current.value
            if (workUri) {
              return fetchExistingResource(workUri).then(function () {
                ractive.set('targetUri.Work', workUri)
              })
            }
          }
        }

        var loadResourceOfQuery = function (applicationData) {
          var query = URI.parseQuery(URI.parse(document.location.href).query)
          var tab = query.openTab
          if (query.Publication) {
            fetchExistingResource(query.Publication)
              .then(loadWorkOfPublication)
              .then(function () {
                ractive.set('targetUri.Publication', query.Publication)
                ractive.fire('activateTab', { keypath: 'inputGroups.' + (tab || '3') })
              })
          } else if (query.Work) {
            fetchExistingResource(query.Work)
              .then(function () {
                ractive.set('targetUri.Work', query.Work)
                ractive.fire('activateTab', { keypath: 'inputGroups.' + (tab || '2') })
              })
          } else {
            ractive.fire('activateTab', { keypath: 'inputGroups.' + (tab || '0') })
          }
          return applicationData
        }

        return axios.get('/config')
          .then(extractConfig)
          .then(loadTemplate)
          .then(loadPartials)
          .then(loadOntology)
          .then(createInputGroups)
          .then(initSelect2)
          .then(initRactive)
          .then(loadResourceOfQuery)
          .then(positionSupportPanels)
          .catch(function (err) {
            console.log("Error initiating Main: " + err)
          })
      },
      repositionSupportPanelsHorizontally: function () {
        var supportPanelLeftEdge = $('#right-dummy-panel').position().left
        var supportPanelWidth = $('#right-dummy-panel').width()

        $('.support-panel').each(function (index, panel) {
          $(panel).css({ left: supportPanelLeftEdge, width: supportPanelWidth })
        })
      },
      getRactive: function () {
        return ractive
      }
    }
    return Main
  }
))
