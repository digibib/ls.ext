/*global window,history*/
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
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI, dialog) {
    'use strict'

    Ractive.DEBUG = false
    var ractive
    var titleRactive
    var supportPanelLeftEdge
    var supportPanelWidth
    require('jquery-ui/dialog')
    require('jquery-ui/accordion')
    require('block-ui')

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

    function checkRangeStart (input) {
      var endRangeInput = $(input).closest('.input').next().find('input')
      var rangeEndVal = Number(endRangeInput.val())
      var startRangeVal = Number($(input).val())
      if (!isNaN(startRangeVal) && (isNaN(rangeEndVal) || rangeEndVal < startRangeVal)) {
        endRangeInput.val(Math.max(startRangeVal, rangeEndVal))
        ractive.updateModel()
      }
    }

    function checkRangeEnd (input) {
      var startRangeInput = $(input).closest('.input').prev().find('input')
      var rangeStartVal = Number(startRangeInput.val())
      var endRangeVal = Number($(input).val())
      if (!isNaN(endRangeVal) && (isNaN(rangeStartVal) || rangeStartVal > endRangeVal)) {
        startRangeInput.val(Math.min(endRangeVal, rangeStartVal))
        ractive.updateModel()
      }
    }

    function saveSuggestionData () {
      var suggestionData = []
      var acceptedData = []
      _.each(ractive.get('inputGroups'), function (group, groupIndex) {
        _.each(group.inputs, function (input, inputIndex) {
          var realInputs = input.subInputs ? _.map(input.subInputs, function (subInput) {
            return subInput.input
          }) : [ input ]

          _.each(realInputs, function (input, subInputIndex) {
            var subInputFragment = input.isSubInput ? `subInputs.${subInputIndex}.input.` : ''
            suggestionData.push({
              keypath: `inputGroups.${groupIndex}.inputs.${inputIndex}.${subInputFragment}suggestedValues`,
              suggestedValues: input.suggestedValues
            })
            _.each(input.values, function (value, index) {
              acceptedData.push({
                keypath: `inputGroups.${groupIndex}.inputs.${inputIndex}.${subInputFragment}values.${index}`,
                value: value
              })
            })
            if (input.searchForValueSuggestions && input.searchForValueSuggestions.hitsFromPreferredSource) {
              acceptedData.push({
                keypath: `inputGroups.${groupIndex}.inputs.${inputIndex}.searchForValueSuggestions.hitsFromPreferredSource`,
                value: input.searchForValueSuggestions.hitsFromPreferredSource
              })
            }
          })
        })
      })
      window.sessionStorage.setItem('suggestionData', JSON.stringify(suggestionData))
      window.sessionStorage.setItem('acceptedData', JSON.stringify(acceptedData))
      let suggestedValueSearchInput = getSuggestedValuesSearchInput()
      if (suggestedValueSearchInput) {
        window.sessionStorage.setItem(suggestedValueSearchInput.searchForValueSuggestions.parameterName, suggestedValueSearchInput.values[ 0 ].current.value)
      }
    }

    function inputHasOpenForm (input) {
      var inputHasOpenForm = false
      if (input.widgetOptions) {
        inputHasOpenForm = _.some(_.pick(input.widgetOptions, 'enableCreateNewResource', 'enableEditResource'), function (action) {
          return !isNaN(Number.parseInt(action.showInputs))
        })
      }
      return inputHasOpenForm
    }

    function clearSupportPanels (options) {
      var keepActions = (options || {}).keep || []
      _.each(allInputs(), function (input) {
        _.each(input.values, function (value) {
          if (value.searchResult && !inputHasOpenForm(input)) {
            value.searchResult = null
          }
        })
      })
      _.each(ractive.get('applicationData.maintenanceInputs'), function (input, index) {
        if (ractive.get('applicationData.maintenanceInputs.' + index + '.widgetOptions.enableCreateNewResource.showInputs') !== undefined ||
          ractive.get('applicationData.maintenanceInputs.' + index + '.widgetOptions.enableEditResource.showInputs') !== undefined) {
          if (input.widgetOptions) {
            _.each(_.difference([ 'enableCreateNewResource', 'enableEditResource' ], keepActions), function (action) {
              if (input.widgetOptions[ action ]) {
                input.widgetOptions[ action ].showInputs = null
                if (!isNaN(Number.parseInt(input.widgetOptions[ action ].showInputs))) {
                  var domainType = input.widgetOptions[ action ].forms[ input.selectedIndexType ].rdfType
                  unloadResourceForDomain(domainType)
                }
              }
            })
          }
        }
      })
      ractive.update()
    }

    var unloadResourceForDomain = function (domainType) {
      _.each(allInputs(), function (input) {
        if (input.domain && domainType === unPrefix(input.domain)) {
          input.values = emptyValues(false)
        }
      })
      ractive.update()
      ractive.set('targetUri.' + domainType, null)
      updateBrowserLocationWithUri(domainType, null)
    }

    var deleteResource = function (uri, deleteConfig, success) {
      _.each(_.pairs(deleteConfig.dialogTemplateValues), function (pair) {
        ractive.set(`${deleteConfig.dialogKeypath}.${pair[ 0 ]}`, valueOfInputByInputId(pair[ 1 ]))
      })
      ractive.set(`${deleteConfig.dialogKeypath}.error`, null)
      var idPrefix = _.uniqueId()
      $(`#${deleteConfig.dialogId}`).dialog({
        resizable: false,
        modal: true,
        width: 450,
        buttons: [
          {
            text: 'Slett',
            id: `${idPrefix}-do-del`,
            click: function () {
              ractive.set(`${deleteConfig.dialogKeypath}.error`, null)
              axios.delete(proxyToServices(uri))
                .then(function (response) {
                  unloadResourceForDomain(deleteConfig.resourceType)
                  $(`#${idPrefix}-do-del, #${idPrefix}-cancel-del`).hide()
                  $(`#${idPrefix}-ok-del`).show()
                  ractive.set(`${deleteConfig.dialogKeypath}.deleted`, true)
                  $(this).dialog('close')
                  return response
                })
                .catch(function (response) {
                  if (response.status === 400 && response.data.numberOfItemsLeft) {
                    ractive.set(`${deleteConfig.dialogKeypath}.error`, { itemsLeft: { numberOfItemsLeft: response.data.numberOfItemsLeft } })
                  } else {
                    ractive.set(`${deleteConfig.dialogKeypath}.error.message`, 'Noe gikk galt under sletting.')
                    $(`#${idPrefix}-do-del, #${idPrefix}-ok-del`).hide()
                    $(`#${idPrefix}-cancel-del`).show()
                  }
                })
            }
          },
          {
            text: 'Avbryt',
            id: `${idPrefix}-cancel-del`,
            click: function () {
              $(this).dialog('close')
              ractive.set(deleteConfig.dialogKeypath, null)
            }
          },
          {
            text: 'Ok',
            id: `${idPrefix}-ok-del`,
            click: function () {
              $(this).dialog('close')
              ractive.set(deleteConfig.dialogKeypath, null)
              if (success) {
                success()
              }
            }
          }
        ],
        open: function () {
          $(`#${idPrefix}-ok-del`).hide()
        }
      })
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
      return typeof predicate === 'string' ? _.last(predicate.split('#')) : predicate
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
          input.values[ index ].suggested = { source: options.source }
          input.suggestedValues = valuesAsArray
        } else if (options.source) {
          input.values[ index ].current.accepted = { source: options.source }
        }
        return valuesAsArray
      }
    }

    function setSingleValue (value, input, index, options) {
      options = options || {}
      if (value) {
        input.values[ index ] = {
          old: options.keepOld ? input.values[ index ].old : {
            value: value.value,
            lang: value.lang
          },
          current: {
            value: value.value,
            lang: value.lang,
            accepted: options.source ? { source: options.source } : undefined
          },
          uniqueId: _.uniqueId()
        }
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
          }, [])).join(' - ')

        var typeMap = ractive.get('applicationData.config.typeMap')
        var selectedIndexType
        _.each(input.indexTypes, function (indexType) {
          if (root.isA(typeMap[ indexType ])) {
            selectedIndexType = indexType
          }
        })

        var multiple = input.isSubInput ? input.parentInput.multiple : input.multiple
        if (options.onlyValueSuggestions) {
          if (multiple) {
            input.values[ index ].suggested = {
              source: options.source,
              selectedIndexType: selectedIndexType
            }
            input.values[ index ].current.displayValue = values
          } else {
            input.suggestedValues = input.suggestedValues || []
            input.suggestedValues[ index ] = {
              value: values,
              source: options.source,
              selectedIndexType: selectedIndexType
            }
          }
        } else {
          input.values[ index ].current.displayValue = values
          if (options.source) {
            input.values[ index ].current.accepted = {
              source: options.source,
              selectedIndexType: selectedIndexType
            }
          }
        }
      }

      if (isBlankNodeUri(uri)) {
        if (root) {
          fromRoot(root)
        }
      } else {
        axios.get(proxyToServices(uri)).then(function (response) {
          var graphData = ensureJSON(response.data)
          var root = ldGraph.parse(graphData).byId(uri)
          fromRoot(root)
          ractive.update()
        })
      }
    }

    function isAdvancedQuery (queryString) {
      return /[:\+\^()´"*]| -[:w]*| AND | OR | NOT /.test(queryString)
    }

    function advancedSearchCharacters () {
      return ':+-^()´"*'
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
        queryParameters = _.omit(queryParameters, _.keys(triumphRanking))
        queryParameters[ type ] = resourceUri
        oldUri.query = URI.buildQuery(_.pick(queryParameters, _.identity))
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

    function updateBrowserLocationWithTemplate (template) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      queryParameters[ 'template' ] = template
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
      updateBrowserLocationWithTab(undefined)
    }

    function updateBrowserLocationWithSuggestionParameter (parameter, value) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      queryParameters.acceptedSuggestionsFrom = `${parameter}:${value}`
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
    }

    function updateBrowserLocationWithQueryParameter (parameter, value) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      queryParameters[ parameter ] = value
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

    function allGroupInputs (handleInput, options) {
      options = options || {}
      var abort = false
      _.each(ractive.get('inputGroups'), function (group, groupIndex) {
        _.each(group.inputs, function (input, inputIndex) {
          if (input.subInputs) {
            _.each(input.subInputs, function (subInput, subInputIndex) {
              if (handleInput(subInput.input, groupIndex, inputIndex, subInputIndex)) {
                abort = true
              }
            })
            if (options.handleInputGroups) {
              if (handleInput(input, groupIndex, inputIndex)) {
                abort = true
              }
            }
          } else {
            if (handleInput(input, groupIndex, inputIndex)) {
              abort = true
            }
          }
        })
        if (abort) {
          return
        }
      })
    }

    function allInputs () {
      var inputs = _.select(ractive.get('inputs'), function (input) {
        return (input.fragment === 'publicationOf' || input.fragment === 'recordID')
      })

      var addInput = function (input, groupIndex, inputIndex, subInputIndex) {
        inputs.push(input)
        var subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
        var forms = ractive.get(`applicationData.inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.widgetOptions.enableCreateNewResource.forms`)
        if (forms) {
          _.each(forms, function (form) {
            inputs = inputs.concat(form.inputs)
          })
        }
      }

      allGroupInputs(addInput)

      _.each(ractive.get('applicationData.maintenanceInputs'), function (input, index) {
        inputs.push(input)
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

    function withPublicationOfWorkInput (handler) {
      var publicationOfInput = _.find(allInputs(), function (input) {
        return (input.fragment === 'publicationOf' && input.domain === 'deichman:Publication' && input.type === 'entity')
      })
      if (publicationOfInput) {
        handler(publicationOfInput)
      }
    }

    function inputFromInputId (inputId) {
      let keypath = ractive.get(`inputLinks.${inputId}`)
      return ractive.get(keypath)
    }

    function updateInputsForResource (response, resourceUri, options, root, type) {
      options = options || {}
      var graphData = ensureJSON(response.data)
      var offsetCrossTypes = { 'Work': 'Publication', 'Publication': 'Work' }
      var typeMap = ractive.get('applicationData.config.typeMap')
      type = type || typeMap[ resourceUri.match(`^.*\/(${_.keys(typeMap).join('|')})\/.*$`)[ 1 ] ]
      root = root || ldGraph.parse(graphData).byId(resourceUri)

      var promises = []
      var skipRest = false
      _.each(options.inputs || allInputs(), function (input, index) {
        if (!skipRest &&
          ((input.domain && type === unPrefix(input.domain) || _.contains((input.subjects), type)) ||
          (input.isSubInput && (type === input.parentInput.domain || _.contains(input.parentInput.subjectTypes, type))) ||
          (options.onlyValueSuggestions && input.suggestValueFrom && type === unPrefix(input.suggestValueFrom.domain)))) {
          let ownerInput = inputFromInputId(input.belongsToCreateResourceFormOfInput)
          if (ownerInput.domain &&
            input.belongsToCreateResourceFormOfInput &&
            ((input.targetResourceIsMainEntry || false) === (options.wrapperObject && options.wrapperObject.isA('MainEntry')) || false) &&
            (unPrefix(ownerInput.domain) === options.wrappedIn || !options.wrappedIn) &&
            (options.wrapperObject && options.wrapperObject.isA(options.wrappedIn) || !options.wrapperObject)) {
            let inputParentOfCreateNewResourceFormKeypath = ractive.get(`inputLinks.${input.belongsToCreateResourceFormOfInput}`)
            ractive.push(`${inputParentOfCreateNewResourceFormKeypath}.suggestedValuesForNewResource`, root)
            skipRest = true
          } else {
            input.offset = input.offset || {}
            var offset = 0
            if (input.offset[ offsetCrossTypes[ type ] ]) {
              offset = input.offset[ offsetCrossTypes[ type ] ]
            }
            var predicate = options.onlyValueSuggestions && input.suggestValueFrom ? input.suggestValueFrom.predicate : input.predicate
            var actualRoots = input.isSubInput ? root.outAll(propertyName(input.parentInput.predicate)) : [ root ]
            var rootIndex = 0
            _.each(actualRoots, function (root) {
              var mainEntryInput = (input.parentInput && input.parentInput.isMainEntry === true) || (input.targetResourceIsMainEntry === true) || false
              var mainEntryNode = (root.isA('MainEntry') === true) || ((options.wrapperObject && options.wrapperObject.isA('MainEntry') === true) || false)
              if (options.overrideMainEntry || mainEntryInput === mainEntryNode) {
                if (_.contains([ 'select-authorized-value', 'entity', 'searchable-authority-dropdown' ], input.type)) {
                  var values = setMultiValues(root.outAll(propertyName(predicate)), input, rootIndex)
                  promises = promises.concat(loadLabelsForAuthorizedValues(values, input, 0, root))
                } else if (input.type === 'searchable-with-result-in-side-panel') {
                  if (!(input.suggestValueFrom && options.onlyValueSuggestions)) {
                    _.each(root.outAll(propertyName(predicate)), function (node, multiValueIndex) {
                      var index = (input.isSubInput ? rootIndex : multiValueIndex) + (offset)
                      setIdValue(node.id, input, index)
                      if (!options.onlyValueSuggestions) {
                        setDisplayValue(input, index, node, options)
                        if (!isBlankNodeUri(node.id)) {
                          input.values[ index ].deletable = true
                          if (input.isSubInput) {
                            input.values[ index ].nonEditable = true
                            input.parentInput.allowAddNewButton = true
                          }
                        }
                        setAllowNewButtonForInput(input)
                        if (options.source) {
                          input.values[ index ].searchable = true
                        } else {
                          input.values[ index ].searchable = false
                        }
                      } else {
                        setDisplayValue(input, index, node, options)
                        input.values[ index ].searchable = true
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
                    setMultiValues(root.outAll(propertyName(predicate)), input, (input.isSubInput ? rootIndex : 0) + (offset), options)
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
                } else if (input.type === 'hidden-url-query-value') {
                  _.each(root.outAll(propertyName(predicate)), function (value) {
                    setIdValue(value.id, input, 0)
                  })
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
                if (input.isSubInput) {
                  //               input.values[ rootIndex ].nonEditable = true
                  input.values = input.values || []
                  input.values[ rootIndex ] = input.values[ rootIndex ] || {}
                  input.values[ rootIndex ].subjectType = type
                  input.parentInput.allowAddNewButton = true
                }
                rootIndex++
              }
            })
            var mainInput = input.isSubInput ? input.parentInput : input
            mainInput.subjectType = type
            input.offset[ type ] = _.flatten(_.compact(_.pluck(_.pluck(input.values, 'current'), 'value'))).length
          }
        }
      })
      Promise.all(promises).then(function () {
        if (!options.deferUpdate || promises.length > 0) {
          ractive.update()
        }
        if (!(options.keepDocumentUrl)) {
          ractive.set('targetUri.' + type, resourceUri)
          ractive.set('save_status', 'åpnet eksisterende ressurs')
          updateBrowserLocationWithUri(type, resourceUri)
        }
      })
    }

    var fetchExistingResource = function (resourceUri, options) {
      options = options || {}
      return axios.get(proxyToServices(resourceUri))
        .then(function (response) {
            updateInputsForResource(response, resourceUri, options)
          }
        )
        .catch(function (err) {
          console.log('HTTP GET existing resource failed with:')
          console.log(err)
        })
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
      return axios.post(ractive.get('config.resourceApiUri') + resourceType.toLowerCase(),
        {}, { headers: { Accept: 'application/ld+json', 'Content-Type': 'application/ld+json' } })
        .then(function (response) {
          var resourceUri = response.headers.location
          _.each(inputsToSave, function (input) {
            var predicate = input.predicate
            _.each(input.values, function (value) {
              Main.patchResourceFromValue(resourceUri, predicate, value, input.datatypes[ 0 ], errors)
              value.old = deepClone(value.current)
            })
          })
          ractive.update()
          return resourceUri
        })
      // .catch(function (err) {
      //    console.log('POST to ' + resourceType.toLowerCase() + ' fails: ' + err)
      //    errors.push(err)
      //    ractive.set('errors', errors)
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
      withPublicationOfWorkInput(function (publicationOfInput) {
        inputsToSave.push(publicationOfInput)
      })

      saveInputs(inputsToSave, resourceType).then(function (resourceUri) {
        ractive.set('targetUri.' + resourceType, resourceUri)
        updateBrowserLocationWithUri(resourceType, resourceUri)
      })
    }

    var loadPredefinedValues = function (url, property) {
      return axios.get(proxyToServices(url))
        .then(function (response) {
          var values = ensureJSON(response.data)
          // resolve all @id uris
          values[ '@graph' ].forEach(function (v) {
            v[ '@id' ] = Ontology.resolveURI(values, v[ '@id' ])
          })

          var valuesSorted = values[ '@graph' ].sort(function (a, b) {
            if (a[ 'label' ][ '@value' ] < b[ 'label' ][ '@value' ]) {
              return -1
            }
            if (a[ 'label' ][ '@value' ] > b[ 'label' ][ '@value' ]) {
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
        searchable: searchable
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
        input.selectedIndexType = input.indexTypes.length === 1 || prop.preselectFirstIndexType ? input.indexTypes[ 0 ] : undefined
      } else {
        input.selectedIndexType = ''
      }
      if (prop.indexDocumentFields) {
        input.indexDocumentFields = prop.indexDocumentFields
      }
      if (prop.type) {
        input.type = prop.type
      }
      input.visible = (prop.type !== 'entity' && prop.type !== 'hidden-url-query-value')
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
        input.searchable = true
      }
      if (prop.required) {
        input.required = prop.required
      }
      if (prop.showOnlyWhen) {
        input.showOnlyWhen = prop.showOnlyWhen
      }
      if (prop.includeOnlyWhen) {
        input.includeOnlyWhen = prop.includeOnlyWhen
      }
      if (prop.isTitleSource) {
        input.isTitleSource = prop.isTitleSource
      }
    }

    var lastFoundOrActualLast = function (lastIndexOfVisible, numberOfInputs) {
      return lastIndexOfVisible === -1 ? numberOfInputs - 1 : lastIndexOfVisible
    }

    function markFirstAndLastInputsInGroup (group) {
      (_.findWhere(group.inputs, { visible: true }) || {}).firstInGroup = true;
      (group.inputs[ lastFoundOrActualLast(_.findLastIndex(group.inputs, function (input) { return input.visible === true }), group.inputs.length) ] || {}).lastInGroup = true
    }

    var typesFromRange = function (range) {
      var inputType
      var rdfType = range
      switch (range) {
        case 'http://www.w3.org/2001/XMLSchema#boolean':
          inputType = 'input-boolean'
          break
        case 'http://www.w3.org/2001/XMLSchema#string':
          inputType = 'input-string'
          break
        case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString':
          inputType = 'input-lang-string'
          break
        case 'http://www.w3.org/2001/XMLSchema#gYear':
          inputType = 'input-gYear'
          break
        case 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger':
          inputType = 'input-nonNegativeInteger'
          break
        case 'http://data.deichman.no/utility#duration':
          inputType = 'input-duration'
          break
        case 'deichman:Place':
        case 'deichman:Work':
        case 'deichman:Person':
        case 'deichman:Event':
        case 'deichman:Corporation':
        case 'deichman:Role':
        case 'deichman:Serial':
        case 'deichman:Contribution':
        case 'deichman:SerialIssue':
        case 'deichman:Subject':
        case 'deichman:Genre':
        case 'deichman:PublicationPart':
        case 'deichman:WorkRelation':
        case 'deichman:Instrument':
        case 'deichman:Instrumentation':
        case 'deichman:CompositionType':
        case 'deichman:ClassificationSource':
        case 'deichman:ClassificationEntry':
        case 'http://www.w3.org/2001/XMLSchema#anyURI':
          rdfType = 'http://www.w3.org/2001/XMLSchema#anyURI'
          inputType = 'input-string'
          break
        default:
          throw new Error('Don\'t know which input-type to assign to range: ' + range)
      }
      return {
        inputType: inputType,
        rdfType: rdfType
      }
    }

    function assignInputTypeFromRange (input) {
      var types = typesFromRange(input.ranges[ 0 ])
      input.type = types.inputType
      input.datatypes = [ types.rdfType ]
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
            input.datatypes = [ 'http://www.w3.org/2001/XMLSchema#anyURI' ]
          } else {
            assignInputTypeFromRange(input)
          }
          inputs.push(input)
          inputMap[ unPrefix(domain) + '.' + input.predicate ] = input
        })
      }
      var inputGroups = []
      var ontologyUri = applicationData.ontology[ '@context' ][ 'deichman' ]

      var createInputForCompoundInput = function (compoundInput, tab, ontologyUri, inputMap) {
        var currentInput = {
          type: 'compound',
          label: compoundInput.label,
          domain: tab.rdfType,
          subjectTypes: compoundInput.subjects,
          subjectType: undefined,
          allowAddNewButton: false,
          subInputs: [],
          predicate: ontologyUri + compoundInput.subInputs.rdfProperty,
          ranges: compoundInput.subInputs.ranges,
          range: compoundInput.subInputs.range,
          inputGroupRequiredVetoes: [],
          accordionHeader: compoundInput.subInputs.accordionHeader,
          orderBy: compoundInput.subInputs.orderBy,
          id: compoundInput.id
        }
        if (_.isArray(currentInput.subjectTypes) && currentInput.subjectTypes.length === 1) {
          currentInput.subjectType = currentInput.subjectTypes[ 0 ]
        }
        _.each(compoundInput.subInputs.inputs, function (subInput) {
          if (!subInput.rdfProperty) {
            throw new Error(`Missing rdfProperty of subInput "${subInput.label}"`)
          }
          var inputFromOntology = deepClone(inputMap[ `${compoundInput.subInputs.range}.${ontologyUri}${subInput.rdfProperty}` ])
          if (!inputFromOntology) {
            throw new Error(`Property "${subInput.rdfProperty}" doesn't have "${compoundInput.subInputs.range}" in its domain`)
          }
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
              headlinePart: subInput.headlinePart,
              suggestValueFrom: subInput.suggestValueFrom,
              id: subInput.id,
              required: subInput.required,
              searchable: type === 'searchable-with-result-in-side-panel',
              showOnlyWhen: subInput.showOnlyWhen,
              isTitleSource: subInput.isTitleSource
            }),
            parentInput: currentInput
          }

          copyResourceForms(newSubInput.input, compoundInput.isMainEntry)

          if (type === 'searchable-with-result-in-side-panel') {
            newSubInput.input.values[ 0 ].searchable = true
          }
          currentInput.subInputs.push(newSubInput)
        })
        return currentInput
      }

      function copyResourceForms (input, targetResourceIsMainEntry) {
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
                  if (targetResourceIsMainEntry) {
                    formInput.targetResourceIsMainEntry = true
                  }
                  if (enableAction === 'enableCreateNewResource' && !input.widgetOptions.maintenance) {
                    if (!input.id) {
                      throw new Error(`Input ${input.label} must have id since it has a create resource form ref`)
                    }
                    formInput.belongsToCreateResourceFormOfInput = input.id
                    input.suggestedValuesForNewResource = []
                  }
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
              widgetOptions: input.widgetOptions,
              suggestValueFrom: input.suggestValueFrom,
              datatypes: input.datatypes,
              showOnlyWhenEmpty: input.searchMainResource.showOnlyWhenMissingTargetUri,
              showOnlyWhen: input.showOnlyWhen,
              dataAutomationId: input.searchMainResource.automationId,
              inputIndex: index,
              id: input.id,
              isTitleSource: input.isTitleSource
            })
          } else if (input.searchForValueSuggestions) {
            groupInputs.push({
              label: input.searchForValueSuggestions.label,
              values: emptyValues(false, true),
              type: 'searchable-for-value-suggestions',
              visible: true,
              widgetOptions: input.widgetOptions,
              datatypes: input.datatypes,
              showOnlyWhenEmpty: input.searchForValueSuggestions.showOnlyWhenMissingTargetUri,
              showOnlyWhen: input.showOnlyWhen,
              dataAutomationId: input.searchForValueSuggestions.automationId,
              searchForValueSuggestions: input.searchForValueSuggestions,
              inputIndex: index,
              id: input.id,
              includeOnlyWhen: input.includeOnlyWhen,
              isTitleSource: input.isTitleSource
            })
          } else {
            input.inputIndex = index
            if (input.rdfProperty) {
              ontologyInput = deepClone(inputMap[ inputGroup.rdfType + '.' + ontologyUri + input.rdfProperty ])
              ontologyInput.suggestedValuesForNewResource = []

              if (typeof ontologyInput === 'undefined') {
                throw new Error(`Group "${inputGroup.id} " specified unknown property "${input.rdfProperty}"`)
              }
              assignUniqueValueIds(ontologyInput)
              if (input.type === 'searchable-with-result-in-side-panel') {
                ontologyInput.values[ 0 ].searchable = true
              }
            } else if (input.subInputs) {
              ontologyInput = createInputForCompoundInput(input, inputGroup, ontologyUri, inputMap)
            } else {
              throw new Error(`Input #${index} of tab or form with id ${inputGroup.id} must have rdfProperty, subInputs or searchMainResource`)
            }

            if (inputGroup.rdfType === unPrefix(ontologyInput.domain)) {
              groupInputs.push(ontologyInput)
              ontologyInput.rdfType = inputGroup.rdfType
            }
            transferInputGroupOptions(input, ontologyInput)
            if (input.widgetOptions) {
              ontologyInput.widgetOptions = input.widgetOptions
            }
            if (input.headlinePart) {
              ontologyInput.headlinePart = input.headlinePart
            }
            if (input.suggestValueFrom) {
              ontologyInput.suggestValueFrom = input.suggestValueFrom
            }
            if (input.id) {
              ontologyInput.id = input.id
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
        group.showOnlyWhenInputHasValue = inputGroup.showOnlyWhenInputHasValue

        if (inputGroup.nextStep) {
          group.nextStep = inputGroup.nextStep
        }
        if (inputGroup.deleteResource) {
          group.deleteResource = inputGroup.deleteResource
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

    function positionSupportPanels (applicationData) {
      var dummyPanel = $('#right-dummy-panel')
      var supportPanelLeftEdge = dummyPanel.position().left
      var supportPanelWidth = dummyPanel.width()
      $('span.support-panel').each(function (index, panel) {
        var supportPanelBaseId = $(panel).attr('data-support-panel-base-ref')
        var supportPanelBase = $(`span:visible[data-support-panel-base-id=${supportPanelBaseId}] input`)
        if (supportPanelBase.length > 0) {
          $(panel).css({
            top: _.last(_.flatten([ supportPanelBase ])).position().top - 15,
            left: supportPanelLeftEdge,
            width: supportPanelWidth
          })
        }
      })
      return applicationData
    }

    function loadWorksAsSubject (target) {
      axios.get(proxyToServices(target.uri + '/asSubjectOfWorks')).then(function (response) {
        target.work = _.pluck(_.pluck(ensureJSON(response).data.hits.hits, '_source'), 'work')
        ractive.update()
      })
    }

    function externalSourceHitDescription (graph, source) {
      var workGraph = graph.byType('Work')[ 0 ]
      if (!workGraph) {
        throw new Error(`Feil i data fra ekstern kilde (${source}). Mangler data om verket.`)
      }
      var mainHitLine = []
      var detailsHitLine = []
      var publicationGraph = graph.byType('Publication')[ 0 ]
      if (!publicationGraph) {
        throw new Error(`Feil i data fra ekstern kilde (${source}). Mangler data om utgivelsen.`)
      }
      mainHitLine = _.map(publicationGraph.getAll('mainTitle'), function (prop) {
        return prop.value
      })
      detailsHitLine = _.map(publicationGraph.getAll('publicationYear'), function (prop) {
        return prop.value
      })

      _.each(workGraph.outAll('contributor'), function (contributor) {
        if (contributor.isA('MainEntry')) {
          var agent = contributor.out('agent')
          detailsHitLine.push(agent.get('name').value)
        }
      })
      return {
        main: mainHitLine.join(' - '),
        details: detailsHitLine.join(' - '),
        graph: graph,
        source: source
      }
    }

    function isBlankNodeUri (uri) {
      return uri && /^_:/.test(uri)
    }

    function getSuggestedValuesSearchInput () {
      var suggestValueInput = _.find(_.flatten(_.pluck(ractive.get('inputGroups'), 'inputs')), function (input) {
        return input.searchForValueSuggestions
      })
      return suggestValueInput
    }

    function valueOfInputByInputId (inputId) {
      let input = _.find(allInputs(), function (input) {
        return inputId === input.id
      })
      return input ? input.values[ 0 ].current[ input.type === 'searchable-with-result-in-side-panel' ? 'displayValue' : 'value' ] : undefined
    }

    function mainEntryContributor (contributionTarget) {
      var author = _.find(contributionTarget.contributors, function (contributor) {
        return contributor.mainEntry
      })
      if (author) {
        var creatorAgent = author.agent
        contributionTarget.creator = creatorAgent.name
        if (creatorAgent.birthYear) {
          contributionTarget.creator += ' (' + creatorAgent.birthYear + '–'
          if (creatorAgent.deathYear) {
            contributionTarget.creator += creatorAgent.deathYear
          }
          contributionTarget.creator += ')'
        }
      }
      return contributionTarget
    }

    function eventShouldBeIgnored (event) {
      return (event.original && event.original.type === 'keyup' && event.original.keyCode !== 13)
    }

    function blockUI () {
      $.blockUI({
        message: null,
        overlayCSS: {
          opacity: 0.5
        }
      })
    }

    function unblockUI () {
      $.unblockUI()
    }

    var Main = {
      searchResultItemHandlers: {
        defaultItemHandler: function (item) {
          return item
        },
        personItemHandler: function (personItem) {
          personItem.subItems = personItem.work
          personItem.subItemType = 'work'
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
          workItem.subItems = workItem.publications
          workItem.subItemType = 'publication'
          return mainEntryContributor(workItem)
        },
        publicationItemHandler: function (publicationItem) {
          mainEntryContributor(publicationItem)
          publicationItem.publicationYear = publicationItem.publicationYear ? ` (${publicationItem.publicationYear})` : ''
          if (publicationItem.recordId) {
            publicationItem.recordId = `tittelnr ${publicationItem.recordId}`
          }
          return publicationItem
        }
      },
      patchResourceFromValue: function (subject, predicate, oldAndcurrentValue, datatype, errors, keypath) {
        var patch = Ontology.createPatch(subject, predicate, oldAndcurrentValue, typesFromRange(datatype).rdfType)
        if (patch && patch.trim() !== '' && patch.trim() !== '[]') {
          ractive.set('save_status', 'arbeider...')
          axios.patch(proxyToServices(subject), patch, {
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
          //    console.log('HTTP PATCH failed with: ')
          //    errors.push('Noe gikk galt! Fikk ikke lagret endringene')
          //    ractive.set('save_status', '')
          // })
        }
      },
      predefinedLabelValue: function (type, uri) {
        return i18nLabelValue(_.find(ractive.get('predefinedValues.' + type), function (predefinedValue) {
          return predefinedValue[ '@id' ] === uri
        })[ 'label' ])
      },

      init: function (options) {
        options = options || {}
        let query = URI.parseQuery(URI.parse(document.location.href).query)
        let template = '/templates/' + (query.template || options.template || 'menu') + '.html'
        var partials = [
          'input',
          'input-string',
          'input-boolean',
          'input-string-large',
          'input-lang-string',
          'input-gYear',
          'input-duration',
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
          'work',
          'publication',
          'delete-publication-dialog',
          'delete-work-dialog',
          'accordion-header-for-collection'
        ]
        // window.onerror = function (message, url, line) {
        //    // Log any uncaught exceptions to assist debugging tests.
        //    // TODO remove this when everything works perfectly (as if...)
        //    console.log('ERROR: '' + message + '' in file: ' + url + ', line: ' + line)
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
            if (!(subInput.input.visible === false)) {
              var value = subInput.input.values[ index ].current.value
              if (typeof value !== 'undefined' && value !== null && (typeof value !== 'string' || value !== '') && (!_.isArray(value) || value.length > 0)) {
                patch.push({
                  op: operation,
                  s: '_:b0',
                  p: subInput.input.predicate,
                  o: {
                    value: _.isArray(value) ? `${value[ 0 ]}` : `${value}`,
                    type: subInput.input.datatypes[ 0 ]
                  }
                })
              }
            }
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
          return axios.patch(proxyToServices(mainSubject), JSON.stringify(patch), {
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
          //    console.log('HTTP PATCH failed with: ')
          //    errors.push('Noe gikk galt! Fikk ikke lagret endringene')
          //    ractive.set('save_status', '')
          // })
        }

        var initRactive = function (applicationData) {
          Ractive.decorators.select2.type.singleSelect = function (node) {
            return {
              maximumSelectionLength: 1,
              templateSelection: function (selection) {
                var source = $(selection.element.parentElement).attr('data-accepted-source')
                var sourceSpan = source ? `<span class='suggestion-source suggestion-source-${source}'/>` : ''
                return $(`<span>${selection.text}${sourceSpan}</span>`)
              }
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
                  return item._source.uri
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
                    obj.id = obj._source.uri
                    obj.text = _.map(inputDef.indexDocumentFields, function (field) {
                      return obj._source[ field ]
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
          var accordionDecorator = function (node) {
            $(node).accordion({
              collapsible: true,
              header: '> .accordion-header'
            })
            return {
              teardown: function () {}
            }
          }
          var repositionSupportPanel = function (node) {
            Main.repositionSupportPanelsHorizontally()
            return {
              teardown: function () {}
            }
          }
          var detectChange = function (node) {
            var enableChange = false
            $(node).on('select2:selecting select2:unselecting', function (event) {
              enableChange = true
            })
            $(node).on('change', function (e) {
              if (enableChange) {
                enableChange = false
                var inputValue = Ractive.getNodeInfo(e.target)
                var keypath = inputValue.keypath
                ractive.set(keypath + '.current.value', $(e.target).val())
                var inputNode = ractive.get(grandParentOf(keypath))
                if (!inputNode.isSubInput && keypath.indexOf('enableCreateNewResource') === -1) {
                  Main.patchResourceFromValue(ractive.get('targetUri.' + unPrefix(inputNode.domain)), inputNode.predicate,
                    ractive.get(keypath), inputNode.datatypes[ 0 ], errors, keypath)
                }
                ractive.update()
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
              var outsideX = event.pageX < supportPanelLeftEdge || event.pageX > (supportPanelLeftEdge + supportPanelWidth)
              var targetIsInsideSupportPanel = !outsideX && $(event.target).closest('span.support-panel').length
              var targetIsSupportPanel = !outsideX && $(event.target).is('span.support-panel')
              var targetIsASupportPanelButton = !outsideX && $(event.target).is('.support-panel-button')

              var targetIsARadioButtonThatWasOffButIsOnNow = !outsideX && $(event.target).is('input[type=\'radio\'][value=\'on\']')
              var targetIsEditResourceLink = !outsideX && $(event.target).is('a.edit-resource')
              var targetIsASelect2RemoveSelectionCross = !outsideX && $(event.target).is('span.select2-selection__choice__remove') && !$(event.target).is('.overrride-outside-detect')
              if (!(targetIsInsideSupportPanel || targetIsARadioButtonThatWasOffButIsOnNow || targetIsSupportPanel || targetIsASupportPanelButton || targetIsASelect2RemoveSelectionCross || targetIsEditResourceLink)) {
                clearSupportPanels({ keep: [ 'enableCreateNewResource' ] })
              }
            })
            return {
              teardown: function () {}
            }
          }
          var unload = function (node) {
            $(window).unload(saveSuggestionData)
            return {
              teardown: function () {}
            }
          }
          var timePicker = function (node) {
            require('timepicker')
            $(node).timepicker({ 'timeFormat': 'H:i:s', step: 50000 })
            return {
              teardown: function () {}
            }
          }
          var slideDown = function (node) {
            let suggestedValues = $(node).find('.suggested-values')[ 0 ]
            $(suggestedValues).hide()
            let toggle = function () {
              $(suggestedValues).slideToggle()
            }
            $(node).find('.expanded, .unexpanded').click(toggle).keypress(function (event) {
              if (!eventShouldBeIgnored(event)) {
                toggle()
              }
            })
            return {
              teardown: function () {}
            }
          }

          titleRactive = new Ractive({
            el: 'title',
            template: '{{title.1 || title.2 || title.3 || "Katalogisering"}}',
            data: applicationData
          })

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
              headlinePart: function (headlinePart) {
                return {
                  value: headlinePart.predefinedValue
                    ? Main.predefinedLabelValue(headlinePart.fragment, this.get(headlinePart.keypath))
                    : this.get(headlinePart.keypath)
                }
              },
              checkDisabledNextStep (disabledUnlessSpec) {
                var enabled = true
                if (disabledUnlessSpec.presentTargetUri) {
                  enabled &= typeof ractive.get('targetUri.' + disabledUnlessSpec.presentTargetUri) !== 'undefined'
                }
                if (disabledUnlessSpec.inputIsNonEditable) {
                  var keypath = ractive.get(`inputLinks.${disabledUnlessSpec.inputIsNonEditable}`)
                  enabled &= ractive.get(`${keypath}.values.0.nonEditable`)
                }
                if (disabledUnlessSpec.inputIsNonEditableWhenNotOverridden) {
                  var nonEditableInputKeypath = ractive.get(`inputLinks.${disabledUnlessSpec.inputIsNonEditableWhenNotOverridden.nonEditableInput}`)
                  var overrridingInputKeypath = ractive.get(`inputLinks.${disabledUnlessSpec.inputIsNonEditableWhenNotOverridden.overridingInput}`)
                  enabled &= (ractive.get(`${nonEditableInputKeypath}.values.0.nonEditable`) || ractive.get(`${overrridingInputKeypath}.values.0.current.value`))
                }
                return !enabled
              },
              getAuthorityLabel: function (uri) {
                return ractive.get('authorityLabels')[ uri ]
              },
              urlEscape: function (url) {
                return url.replace(/[:\/\.]/g, '_')
              },
              isSelected: function (option, value) {
                return option[ '@id' ].contains(value) ? 'selected=\'selected\'' : ''
              },
              getRdfsLabelValue: function (label) {
                return i18nLabelValue(label)
              },
              tabEnabled: function (tabSelected, domainType) {
                return tabSelected === true || (typeof ractive.get('targetUri.' + domainType) === 'string')
              },
              spy: function (node, nmode2) {
                console.dir(node)
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
                return _.compact(_.values(_.pick(item, itemLabelProperties))).join(' - ')
              },
              tabIdFromDocumentUrl: function () {
                var uri = URI.parse(document.location.href)
                var queryParameters = URI.parseQuery(uri.query)
                return queryParameters.openTab || 0
              },
              unacceptedSuggestions: function (input) {
                return _.find(input.subInputs[ 0 ].input.values, function (value) {
                  return value.suggested && value.suggested !== null
                })
              },
              isAdvancedQuery: isAdvancedQuery,
              advancedSearchCharacters: advancedSearchCharacters,
              valueOfInputById: function (inputId, valueIndex) {
                var keyPath = ractive.get(`inputLinks.${inputId[ 0 ]}`)
                return ractive.get(`${keyPath}.values.${valueIndex}.current.value`)
              },
              checkRequiredInputValueForShow: function (showOnlyWhenInputHasValueSpec) {
                if (!(showOnlyWhenInputHasValueSpec && showOnlyWhenInputHasValueSpec.showOnlyWhenInputHasValue)) {
                  return true
                } else {
                  return valueOfInputByInputId(showOnlyWhenInputHasValueSpec.showOnlyWhenInputHasValue, 0)
                }
              },
              valueOrderOfInputById: function (inputId, valueIndex) {
                if (inputId) {
                  let keyPath = ractive.get(`inputLinks.${inputId[ 0 ]}`)
                  let value = ractive.get(`${keyPath}.values.${valueIndex}.current.value`)
                  let values = ractive.get(`${keyPath}.values`)
                  let index = _.findIndex(_.sortBy(values, function (val) { return val.current.value }), function (v) {
                    return v.current.value === value
                  })
                  if (index > -1) {
                    return Number(index + 1).toString()
                  } else {
                    return null
                  }
                } else {
                  return valueIndex + 1
                }
              },
              checkShouldInclude: function (input) {
                var shouldInclude = true
                if (input.includeOnlyWhen) {
                  _.each(_.keys(input.includeOnlyWhen), function (property) {
                    let includeWhenValues = _.flatten([ input.includeOnlyWhen[ property ] ])
                    allGroupInputs(function (input1) {
                      if (input1.fragment === property && !_.contains(includeWhenValues, _.flatten([
                          propertyName(URI.parseQuery(document.location.href)[ property ] ||
                            input1.values[ 0 ].current.value)
                        ])[ 0 ])) {
                        shouldInclude = false
                        return true
                      }
                    })
                  })
                }
                return shouldInclude
              }
            },
            decorators: {
              multi: require('ractive-multi-decorator'),
              repositionSupportPanel: repositionSupportPanel,
              detectChange: detectChange,
              handleAddNewBySelect2: handleAddNewBySelect2,
              clickOutsideSupportPanelDetector: clickOutsideSupportPanelDetector,
              unload: unload,
              accordion: accordionDecorator,
              timePicker: timePicker,
              slideDown: slideDown
            },
            partials: applicationData.partials,
            transitions: {
              accordion: function (transition) {
                $($(transition.element.node)[ 0 ]).accordion({
                  active: false,
                  collapsible: true,
                  header: '.accordionHeader',
                  heightStyle: 'content',
                  icons: {
                    header: 'ui-icon-circle-plus',
                    activeHeader: 'ui-icon-circle-minus'
                  }
                })
              },
              accordionSection: function (transition) {
                var parent = $(transition.element.node).parent()
                if (parent.accordion()) {
                  parent.accordion('refresh')
                  parent.accordion('option', 'active', false)
                }
              },
              slideIn: function (transition) {
                $(transition.element.node).hide()
                $(transition.element.node).slideDown()
              },
              slideOut: function (transition) {
                $(transition.element.node).slideUp({
                  complete: function () {
                    $('div.grid-panel-selected span.input-panel span.panel-part:visible').first().addClass('first')
                    $('div.grid-panel-selected span.input-panel span.panel-part:visible').last().addClass('last')
                  }
                })
              }
            }
          })
          ractive.on({
              toggle: function (event) {
                if (eventShouldBeIgnored(event)) return
                this.toggle(event.keypath + '.expanded')
              },
              updateBrowserLocationWithTab: function (event, tabId) {
                updateBrowserLocationWithTab(tabId)
              },
              // addValue adds another input field for the predicate.
              addValue: function (event) {
                if (eventShouldBeIgnored(event)) return
                var mainInput = ractive.get(event.keypath)
                visitInputs(mainInput, function (input, index) {
                  var length = input.values.length
                  input.values[ length ] = emptyValues(false, input.type === 'searchable-with-result-in-side-panel')[ 0 ]
                  if (index === 0) {
                    input.values[ length ].subjectType = _.isArray(mainInput.subjectTypes) && mainInput.subjectTypes.length === 1
                      ? mainInput.subjectTypes[ 0 ]
                      : null
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
                if (!input.isSubInput && (event.keypath.indexOf('enableCreateNewResource') === -1)) {
                  var inputValue = event.context
                  if (inputValue.error || (inputValue.current.value === '' && inputValue.old.value === '')) {
                    return
                  }
                  var datatypeKeypath = grandParentOf(event.keypath) + '.datatypes.0'
                  var subject = ractive.get('targetUri.' + rdfType)
                  if (subject) {
                    Main.patchResourceFromValue(subject, predicate, inputValue, ractive.get(datatypeKeypath), errors, event.keypath)
                    event.context.domain = rdfType
                    input.allowAddNewButton = true
                  }
                  if (clearProperty) {
                    ractive.set(grandParentOf(event.keypath) + '.' + clearProperty, null)
                  }
                }
                ractive.update()
              },
              saveObject: function (event, index) {
                if (eventShouldBeIgnored(event)) return
                var input = event.context
                patchObject(input, applicationData, index, 'add').then(function () {
                  visitInputs(input, function (input) {
                    if (input.isSubInput) {
                      _.each(input.values, function (value, valueIndex) {
                        if (valueIndex === index) {
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
                  ractive.update()
                  var subInputs = grandParentOf(grandParentOf(event.keypath))
                  _.each(parentInput.subInputs, function (subInput, subInputIndex) {
                    if (_.isArray(subInput.input.values)) {
                      subInput.input.values.splice(index, 1)
                      ractive.update()
                    }
                  })
                  // $(event.node).closest('.ui-accordion-content').prev().remove()
                  // $(event.node).closest('.ui-accordion-content, .field').remove()
                  ractive.update().then(function () {
                    if (ractive.get(`${subInputs}.0.input.values`).length === 0) {
                      var addValueEvent = { keypath: parentOf(subInputs) }
                      ractive.fire('addValue', addValueEvent)
                    }
                  })
                })
              },
              searchResource: function (event, searchString, preferredIndexType, secondaryIndexType, loadWorksAsSubjectOfItem, options) {
                let indexType = preferredIndexType || secondaryIndexType
                options = options || {}
                if (options.skipIfAdvancedQuery && isAdvancedQuery(searchString)) {
                  return
                }
                var inputkeyPath = grandParentOf(event.keypath)
                if (!searchString) {
                  if (ractive.get(event.keypath + '.searchResult.')) {
                    ractive.set(event.keypath + '.searchResult.', null)
                  }
                } else {
                  var searchBody
                  var config = ractive.get('config')
                  var axiosMethod
                  if (config.search[ indexType ].structuredQuery && !isAdvancedQuery(searchString)) {
                    axiosMethod = axios.post
                    var filters = {
                      personAsMainEntryFilter: function (filterArg) {
                        return {
                          nested: {
                            path: 'contributors',
                            query: {
                              bool: {
                                filter: [
                                  {
                                    term: {
                                      'contributors.mainEntry': true
                                    }
                                  },
                                  {
                                    nested: {
                                      path: 'contributors.agent',
                                      query: {
                                        term: {
                                          'contributors.agent.uri': filterArg
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
                    _.each(config.search[ indexType ].queryTerms, function (queryTerm) {
                      matchBody[ queryTerm.field ] = {
                        query: `${searchString}${queryTerm.wildcard ? '*' : ''}`,
                        operator: 'and'
                      }
                    })

                    var filterName = filterArg ? ractive.get(inputkeyPath + '.widgetOptions.filter.name') || 'default' : 'default'

                    searchBody = {
                      query: {
                        bool: {
                          filter: [
                            {
                              match: matchBody
                            }, filters[ filterName ](filterArg)
                          ]
                        }
                      }
                    }
                  } else {
                    axiosMethod = axios.get
                    var query = isAdvancedQuery(searchString) ? searchString : _.map(config.search[ indexType ].queryTerms, function (queryTerm) {
                      var wildCardPostfix = queryTerm.wildcard ? '*' : ''
                      return `${queryTerm.field}:${searchString}${wildCardPostfix}`
                    }).join(' OR ')
                    searchBody = {
                      params: {
                        q: query
                      }
                    }
                  }
                  var searchURI = `${config.resourceApiUri}search/${config.search[ indexType ].type}/_search`

                  axiosMethod(searchURI, searchBody)
                    .then(function (response) {
                      var results = ensureJSON(response.data)
                      results.hits.hits.forEach(function (hit) {
                        var item = hit._source
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
                        items: _.map(_.pluck(results.hits.hits, '_source'),
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
                if (eventShouldBeIgnored(event)) return
                ractive.fire('searchResource', { keypath: grandParentOf(event.keypath) + '.values.0' }, searchString, indexType, loadWorksAsSubjectOfItem)
              },
              toggleSubItem: function (event, findWorksAsSubjectOfType, origin) {
                var keypath = event.keypath + '.toggleSubItem'
                ractive.get(keypath) !== true ? ractive.set(keypath, true) : ractive.set(keypath, false)
                if (findWorksAsSubjectOfType && !origin.subItems) {
                  loadWorksAsSubject(origin)
                }
              },
              selectSearchableItem: function (event, origin, displayValue, options) {
                options = options || {}
                ractive.set(origin + '.searchResult', null)
                var inputKeyPath = grandParentOf(origin)
                var input = ractive.get(inputKeyPath)
                var uri = event.context.uri
                var template = ractive.get(inputKeyPath + '.widgetOptions.editWithTemplate')
                if (template) {
                  fetchExistingResource(uri).then(function () {
                    let initOptions = { presetValues: {} }
                    updateBrowserLocationWithTemplate(template)
                    allGroupInputs(function (input) {
                      if (input.type === 'hidden-url-query-value' &&
                        typeof input.values[ 0 ].current.value === 'string' &&
                        input.values[ 0 ].current.value !== '') {
                        let shortValue = input.values[ 0 ].current.value.replace(input.widgetOptions.prefix, '')
                        initOptions.presetValues[ input.widgetOptions.queryParameter ] = shortValue
                        updateBrowserLocationWithQueryParameter(input.widgetOptions.queryParameter, shortValue)
                      }
                    })
                    if (uri.indexOf('publication') !== -1) {
                      updateBrowserLocationWithTab(1)
                    }
                    Main.init(initOptions)
                  })
                } else if (ractive.get(inputKeyPath + '.widgetOptions.enableInPlaceEditing')) {
                  var indexType = ractive.get(inputKeyPath + '.indexTypes.0')
                  var rdfType = ractive.get(inputKeyPath + '.widgetOptions.enableEditResource.forms.' + indexType).rdfType
                  unloadResourceForDomain(rdfType)
                  fetchExistingResource(uri)
                  ractive.set(inputKeyPath + '.widgetOptions.enableEditResource.showInputs', Number.parseInt(_.last(origin.split('.'))))
                } else if (input.isMainEntry || options.subItem) {
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
                  ractive.update()
                }
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
                  var inputs = allInputs()
                  _.each(_.keys(newResourceType.prefillValuesFromResource), function (copyFromType) {
                    _.each(newResourceType.prefillValuesFromResource[ copyFromType ], function (fragment) {
                      var sourceInput = _.find(inputs, function (input) {
                        return (input.fragment === fragment && unPrefix(input.domain) === copyFromType)
                      })
                      if (sourceInput) {
                        var targetInput = _.find(inputs, function (input) {
                          return (input.fragment === fragment && unPrefix(input.domain) === newResourceType.type)
                        })
                        if (targetInput) {
                          targetInput.datatypes = sourceInput.datatypes
                          if (targetInput.type === 'select-predefined-value') {
                            sourceInput.values[ 0 ].current.value = _.union(sourceInput.values[ 0 ].current.value, targetInput.values[ 0 ].current.value)
                          } else {
                            _.each(sourceInput.values, function (sourceValue) {
                              if (!_.some(targetInput.values, function (targetValue) {
                                  return targetValue.current.value === sourceValue.current.value
                                })) {
                                targetInput.values = targetInput.values || []
                                if (targetInput.values.length === 1 && targetInput.values[ 0 ].current.value === '' || targetInput.values[ 0 ].current.value === null) {
                                  targetInput.values[ 0 ] = deepClone(sourceValue)
                                } else {
                                  targetInput.values.push(deepClone(sourceValue))
                                }
                              }
                            })
                          }
                        }
                      }
                    })
                  })
                  saveNewResourceFromInputs(newResourceType.type)
                  ractive.update()
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
              deleteResource: function (event) {
                var uriToDelete = ractive.get(`targetUri.${event.context.resourceType}`)
                deleteResource(uriToDelete, event.context, function () {
                  if (event.context.afterSuccess) {
                    if (event.context.afterSuccess.setResourceInDocumentUrlFromTargetUri) {
                      var targetUri = ractive.get(`targetUri.${event.context.afterSuccess.setResourceInDocumentUrlFromTargetUri}`)
                      if (targetUri) {
                        updateBrowserLocationWithUri(event.context.afterSuccess.setResourceInDocumentUrlFromTargetUri, targetUri)
                      }
                    }
                    if (event.context.afterSuccess.gotoTab !== undefined) {
                      ractive.fire('activateTab', { keypath: 'inputGroups.' + (event.context.afterSuccess.gotoTab) })
                    }
                  }
                })
              },
              showCreateNewResource: function (event, origin) {
                if (eventShouldBeIgnored(event)) return
                ractive.set(origin + '.searchResult.hidden', true)
                ractive.set(`${grandParentOf(event.keypath)}.showInputs`, event.index.inputValueIndex || 0)
                var searchTerm = ractive.get(origin + '.searchResult.searchTerm')
                if (searchTerm) {
                  _.each(event.context.inputs, function (input) {
                    if (input.preFillFromSearchField) {
                      input.values[ 0 ].current.value = searchTerm
                    } else if (input.type !== 'hidden-url-query-value') {
                      input.values = emptyValues(input.type === 'select-predefined-value')
                    }
                  })
                }
                let suggestedValuesGraphNode = ractive.get(`${grandParentOf(grandParentOf(event.keypath))}.suggestedValuesForNewResource.${event.index.inputValueIndex}`)
                if (suggestedValuesGraphNode) {
                  updateInputsForResource({ data: {} }, null, {
                    keepDocumentUrl: true,
                    source: event.context.source,
                    inputs: event.context.inputs,
                    deferUpdate: true,
                    overrideMainEntry: true
                  }, suggestedValuesGraphNode, event.context.rdfType)
                }
                ractive.update()
              },
              createNewResource: function (event, origin) {
                var maintenance = origin.indexOf('maintenanceInputs') !== -1
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
                  var targetInput = ractive.get(grandParentOf(origin))
                  if (!useAfterCreation && !targetInput.isSubInput) {
                    Main.patchResourceFromValue(ractive.get('targetUri.' + targetInput.rdfType), targetInput.predicate, ractive.get(origin), targetInput.datatypes[ 0 ], errors)
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
                    ractive.set(event.keypath + '.inputs.' + index + '.values', emptyValues(false, true))
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
                clearSupportPanels()
                ractive.set(grandParentOf(event.keypath) + '.showInputs', null)
              },
              fetchValueSuggestions: function (event) {
                var searchValue = event.context.current.value.replace(/[ -]/g, '')
                if (searchValue && searchValue !== '') {
                  var searchExternalSourceInput = ractive.get(grandParentOf(event.keypath))
                  if (searchExternalSourceInput.searchForValueSuggestions.pattern && !(new RegExp(searchExternalSourceInput.searchForValueSuggestions.pattern).test(searchValue))) {
                    return
                  }
                  searchExternalSourceInput.searchForValueSuggestions.hitsFromPreferredSource = []
                  searchExternalSourceInput.searchForValueSuggestions.valuesFromPreferredSource = []
                  _.each(allInputs(), function (input) {
                    input.suggestedValues = null
                  })
                  ractive.update()
                  var sources = ractive.get('applicationData.externalSources') || searchExternalSourceInput.searchForValueSuggestions.sources
                  var promises = []
                  blockUI()
                  let resultStat = {
                    itemsFromPreferredSource: 0,
                    itemsFromOtherSources: {}
                  }
                  _.each(sources, function (source) {
                    promises.push(axios.get(`/valueSuggestions/${source}/${searchExternalSourceInput.searchForValueSuggestions.parameterName}/${searchValue}`).then(function (response) {
                      var fromPreferredSource = response.data.source === searchExternalSourceInput.searchForValueSuggestions.preferredSource.id
                      var hitsFromPreferredSource = { source: response.data.source, items: [] }
                      _.each(response.data.hits, function (hit) {
                        var graph = ldGraph.parse(hit)
                        if (fromPreferredSource) {
                          hitsFromPreferredSource.items.push(externalSourceHitDescription(graph, response.data.source))
                          resultStat.itemsFromPreferredSource++
                        } else {
                          var options = {
                            keepDocumentUrl: true,
                            onlyValueSuggestions: true,
                            source: response.data.source
                          }
                          _.each([ 'Work', 'Publication' ], function (domain) {
                            let byType = graph.byType(domain)
                            updateInputsForResource({ data: {} }, null, options, byType[ 0 ], domain)
                            resultStat.itemsFromOtherSources[ source ] = resultStat.itemsFromOtherSources[ source ] || 0
                            resultStat.itemsFromOtherSources[ source ]++
                          })
                        }
                      })
                      if (fromPreferredSource) {
                        searchExternalSourceInput.searchForValueSuggestions.hitsFromPreferredSource.push(hitsFromPreferredSource)
                      }
                      ractive.update()
                    }).then(function () {
                      updateBrowserLocationWithSuggestionParameter(searchExternalSourceInput.searchForValueSuggestions.parameterName, searchValue)
                    }).catch(function (error) {
                      errors.push(error)
                    }))
                  })
                  Promise.all(promises).then(function () {
                    unblockUI()
                    if (resultStat.itemsFromPreferredSource + _.reduce(
                        _.values(resultStat.itemsFromOtherSources), function (memo, value) {
                          return memo + value
                        }, 0) === 0) {
                      $('#search-suggestion-result-dialog').dialog({
                        modal: true,
                        width: 450,
                        buttons: [
                          {
                            text: 'Ok',
                            click: function () {
                              $(this).dialog('close')
                            }
                          }
                        ]
                      })
                    }
                  })
                }
              },
              acceptSuggestedPredefinedValue: function (event, value) {
                var input = ractive.get(grandParentOf(event.keypath))
                var source = $(event.node).attr('data-accepted-source')
                if (!input.multiple) {
                  setMultiValues([ { id: value.value } ], input, 0, { source: source })
                } else {
                  var oldValues = _.map(input.values[ 0 ].current.value, function (value) {
                    return { id: value }
                  })
                  oldValues.push({ id: value.value })
                  setMultiValues(oldValues, input, 0, { source: source })
                }
                ractive.update()
                ractive.fire('patchResource',
                  { keypath: grandParentOf(event.keypath) + '.values.0', context: input.values[ 0 ] },
                  input.predicate,
                  unPrefix(input.domain))
              },
              acceptSuggestedLiteralValue: function (event, value) {
                var input = ractive.get(grandParentOf(event.keypath))
                var oldValues = input.values
                if (!input.multiple) {
                  setSingleValue(value, input, 0, { keepOld: true })
                } else {
                  setSingleValue(value, input, oldValues.length)
                }
                ractive.update()
                var valueIndex = oldValues ? oldValues.length - 1 : 0
                ractive.fire('patchResource',
                  {
                    keypath: grandParentOf(event.keypath) + '.values.' + (valueIndex),
                    context: input.values[ valueIndex ]
                  },
                  input.predicate,
                  unPrefix(input.domain))
              },
              acceptExternalItem: function (event) {
                var inputsWithValueSuggestionEnabled = _.filter(allInputs(), function (input) {
                    return input.suggestValueFrom
                  }
                )
                blockUI()
                let prefillValuesFromExternalSources = ractive.get('applicationData.config.prefillValuesFromExternalSources')
                _.each(prefillValuesFromExternalSources, function (suggestionSpec) {
                  var domain = suggestionSpec.resourceType
                  var wrappedIn = suggestionSpec.wrappedIn
                  var demandTopBanana = false
                  if (wrappedIn && wrappedIn.substr(0, 1) === '/') {
                    wrappedIn = wrappedIn.substr(1)
                    demandTopBanana = true
                  }
                  _.each(event.context.graph.byType(wrappedIn || suggestionSpec.resourceType), function (node) {
                    if (!demandTopBanana || node.isA('TopBanana')) {
                      var wrapperObject
                      var nodes = [ node ]
                      if (suggestionSpec.predicate) {
                        wrapperObject = node
                        nodes = node.outAll(suggestionSpec.predicate)
                      }
                      _.each(nodes, function (node) {
                        updateInputsForResource({ data: {} }, null, {
                          keepDocumentUrl: true,
                          source: event.context.source,
                          wrapperObject: wrapperObject,
                          wrappedIn: wrappedIn,
                          deferUpdate: true
                        }, node, domain)

                        if (node.isA('TopBanana')) {
                          _.each(inputsWithValueSuggestionEnabled, function (input) {
                            if (input.suggestValueFrom.domain === domain && !wrapperObject) {
                              input.values = input.values || [ { current: {} } ]
                              _.each(node.getAll(propertyName(input.suggestValueFrom.predicate)), function (value, index) {
                                input.values[ index ].current.displayValue = value.value
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                })
                unblockUI()
                ractive.set('primarySuggestionAccepted', true)
              },
              useSuggestion: function (event) {
                event.context.suggested = null
                event.context.keepOrder = true
                event.context.suggested = null
                let subInputs = ractive.get(grandParentOf(grandParentOf(event.keypath)))
                _.each(subInputs, function (subInput) {
                  if (typeof subInput.input.values[ event.index.inputValueIndex ].searchable === 'boolean') {
                    subInput.input.values[ event.index.inputValueIndex ].searchable = true
                  }
                  if (typeof subInput.input.values[ event.index.inputValueIndex ].suggested === 'object') {
                    subInput.input.values[ event.index.inputValueIndex ].suggested = null
                  }
                })
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
              var veto = !(typeof newValue === 'string' && newValue.length > 0) ||
                (input.type === 'searchable-with-result-in-side-panel' && typeof newValue === 'string' && isBlankNodeUri(newValue))
              castVetoForRequiredSubInput(inputGroupKeypath, valueIndex, voter, veto)
            }
          }

          ractive.observe('applicationData.inputGroups.*.inputs.*.subInputs.0.input.values.*.subjectType', function (newValue, oldValue, keypath) {
            checkRequiredSubjectTypeSelection(keypath, newValue)
          }, { init: false })

          ractive.observe('applicationData.inputGroups.*.inputs.*.subInputs.*.input.values.*.current.value', function (newValue, oldValue, keypath) {
            checkRequiredSubInput(newValue, keypath)
          })

          ractive.observe('applicationData.inputGroups.*.inputs.*.values.*', function (newValue, oldValue, keypath) {
            if (newValue && newValue.current) {
              if (!newValue.current.value) {
                ractive.set(keypath + '.error', false)
                return
              }
              var parent = grandParentOf(keypath)
              var uri = _.flatten([ newValue.current.value ])[ 0 ]
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
          }, { init: false })

          ractive.observe('targetUri.Work', function (newValue, oldValue, keypath) {
            withPublicationOfWorkInput(function (input) {
              input.values = [
                {
                  current: {
                    value: newValue
                  }
                }
              ]
              ractive.update()
            })
          }, { init: false })

          ractive.observe('inputGroups.*.tabSelected', function (newValue, oldValue, keypath) {
            if (newValue === true) {
              updateBrowserLocationWithTab(keypath.split('.')[ 1 ])
            }
          }, { init: false })

          ractive.observe('applicationData.maintenanceInputs.*.widgetOptions.*.showInputs', function (newValue, oldValue, keypath) {
            var openInputForms = ractive.get('openInputForms') || []
            if (!isNaN(parseInt(newValue))) {
              openInputForms = _.union(openInputForms, [ keypath ])
            } else {
              openInputForms = _.without(openInputForms, keypath)
            }
            ractive.set('openInputForms', openInputForms)
          }, { init: false })

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
          withPublicationOfWorkInput(function (publicationOfInput) {
            var workUri = _.flatten([ publicationOfInput.values[ 0 ].current.value ])[ 0 ]
            if (workUri) {
              return fetchExistingResource(workUri).then(function () {
                ractive.set('targetUri.Work', workUri)
              })
            }
          })
        }

        var loadResourceOfQuery = function (applicationData) {
          var query = URI.parseQuery(URI.parse(document.location.href).query)
          var tab = query.openTab
          var externalSources = _.compact(_.flatten([ query.externalSource ]))
          if (externalSources && externalSources.length > 0) {
            applicationData.externalSources = externalSources
          }
          var suggestionsAccepted = query.acceptedSuggestionsFrom
          if (suggestionsAccepted) {
            var suggestionParts = suggestionsAccepted.split(':')
            var property = suggestionParts[ 0 ]
            var value = suggestionParts[ 1 ]
            var suggestValueInput = getSuggestedValuesSearchInput()
            if (suggestValueInput) {
              if (window.sessionStorage[ property ] && window.sessionStorage[ property ] === value) {
                var suggestionData = JSON.parse(window.sessionStorage.suggestionData)
                _.each(suggestionData, function (ractiveData) {
                  ractive.set(ractiveData.keypath, ractiveData.suggestedValues)
                })
                var acceptedData = JSON.parse(window.sessionStorage.acceptedData)
                _.each(acceptedData, function (ractiveData) {
                  ractive.set(ractiveData.keypath, ractiveData.value)
                })
                ractive.set('primarySuggestionAccepted', true)
              }
              suggestValueInput.values = [ {
                current: {
                  value: value
                }
              } ]
              ractive.update()
              window.sessionStorage.clear()
            }
          }
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

        var initHeadlineParts = function (applicationData) {
          var headlineParts = []
          allGroupInputs(function (input, groupIndex, inputIndex, subInputIndex) {
            if (input.headlinePart) {
              var subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
              var keypath
              if (input.type === 'select-predefined-value') {
                input.headlinePart.predefinedValue = true
                keypath = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.values.0.current.value[0]`
              } else {
                var valuePart = input.type === 'searchable-with-result-in-side-panel' ? 'displayValue' : 'value'
                keypath = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.values.0.current.${valuePart}`
              }
              input.headlinePart.keypath = keypath
              input.headlinePart.fragment = input.fragment
              headlineParts.push(input.headlinePart)
            }
          })
          applicationData.headlineParts = headlineParts
          ractive.update()
          return applicationData
        }

        var initInputLinks = function (applicationData) {
          var inputLinks = {}
          allGroupInputs(function (input, groupIndex, inputIndex, subInputIndex) {
            if (input.id) {
              if (inputLinks[ input.id ]) {
                throw new Error(`Duplicate input id: "${input.id}"`)
              }
              var subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
              var keypath = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}`
              inputLinks[ input.id ] = keypath
            }
          }, { handleInputGroups: true })
          ractive.set('inputLinks', inputLinks)
          applicationData.inputLinks = inputLinks
          return applicationData
        }

        var initInputInterDependencies = function (applicationData) {
          allGroupInputs(function (input) {
            function setInputVisibility (inputKeypath, visible) {
              ractive.set(`${inputKeypath}.visible`, visible)
                .then(positionSupportPanels)
                .then(Main.repositionSupportPanelsHorizontally)
            }

            if (input.showOnlyWhen) {
              if (!input.id) {
                throw new Error(`Input "${input.label}" should have its own id attribute in order to handle dependency of input with id "${input.showOnlyWhen.inputId}"`)
              }
              let inputKeypath = applicationData.inputLinks[ input.showOnlyWhen.inputId ]
              if (input.showOnlyWhen.valueAsStringMatches) {
                ractive.observe(`${inputKeypath}.values.*.current.value`, function (newValue, oldValue, keypath) {
                  if (newValue !== oldValue) {
                    setInputVisibility(applicationData.inputLinks[ input.id ], `${_.isArray(newValue) ? newValue[ 0 ] : newValue}`.match(input.showOnlyWhen.valueAsStringMatches) !== null)
                  }
                }, { init: false })
              }
              if (input.showOnlyWhen.initial && input.showOnlyWhen.initial === 'hide') {
                setInputVisibility(applicationData.inputLinks[ input.id ], false)
              }
            }
          }, { handleInputGroups: true })
          return applicationData
        }

        let initValuesFromQuery = function (applicationData) {
          _.each(allInputs(), function (input) {
            if (input.type === 'hidden-url-query-value' &&
              input.widgetOptions && input.widgetOptions.queryParameter &&
              ((options.presetValues || {})[ input.widgetOptions.queryParameter ] || query[ input.widgetOptions.queryParameter ])) {
              let queryValue = (input.widgetOptions.prefix || '') + ((options.presetValues || {})[ input.widgetOptions.queryParameter ] || query[ input.widgetOptions.queryParameter ])
              if (queryValue) {
                input.values = [ {
                  current: {
                    value: queryValue
                  },
                  old: {
                    value: undefined
                  }
                } ]
              }
              ractive.update()
            }
          })
          return applicationData
        }

        let initTitle = function (applicationData) {
          allGroupInputs(function (input) {
            let titleSource = input.isTitleSource
            if (titleSource) {
              let keypath = ractive.get(`inputLinks.${input.id}`)
              ractive.observe(`${keypath}.values.0.current.value`, function (newValue) {
                let title = `${newValue || ''}${titleSource.qualifier || ''}`
                if (typeof newValue === 'string' && newValue !== '') {
                  titleRactive.set(`title.${titleSource.priority}`, title)
                }
              })
            }
          })
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
          .then(initHeadlineParts)
          .then(initInputLinks)
          .then(initInputInterDependencies)
          .then(initTitle)
          .then(initValuesFromQuery)
        // .catch(function (err) {
        //   console.log('Error initiating Main: ' + err)
        // })
      },
      repositionSupportPanelsHorizontally: function () {
        supportPanelLeftEdge = $('#right-dummy-panel').offsetParent().left
        supportPanelWidth = $('#right-dummy-panel').width()

        $('.support-panel').each(function (index, panel) {
          $(panel).css({ left: supportPanelLeftEdge, width: supportPanelWidth })
        })
      },
      getRactive: function () {
        return ractive
      },
      $: $,
      _: _,
      saveSuggestionData: saveSuggestionData,
      checkRangeStart: checkRangeStart,
      checkRangeEnd: checkRangeEnd
    }
    return Main
  }
))
