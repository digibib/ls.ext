/*global window,history*/
(function (root, factory) {
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
    var esquery = require('./esquery')
    require('isbn2')
    module.exports = factory(Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI, window.ISBN, esquery)
  } else {
    // Browser globals (root is window)
    root.Main = factory(root.Ractive, root.axios, root.Graph, root.Ontology, root.StringUtil, root._, root.$, root.ldGraph, root.URI, root.ISBN, root.esquery)
  }
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI, ISBN, esquery) {
    'use strict'

    Ractive.DEBUG = false
    let ractive
    let titleRactive
    let supportPanelLeftEdge
    let supportPanelWidth
    require('jquery-ui/dialog')
    require('jquery-ui/accordion')
    require('jquery-ui/slider')
    require('jquery-ui/draggable')
    require('jquery-ui/droppable')
    require('jquery.scrollto')
    let etagData = {}
    require('isbn2')
    ISBN = ISBN || window.ISBN // I think this was needed because of extra parameter 'dialog' in init above
    var Spinner = require('spin')

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
      var changes = false
      var keepActions = (options || {}).keep || []
      _.each(allInputs(), function (input) {
        _.each(input.values, function (value) {
          if (value && value.searchResult && !inputHasOpenForm(input)) {
            value.searchResult = null
            changes = true
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
                changes = true
                if (!isNaN(Number.parseInt(input.widgetOptions[ action ].showInputs))) {
                  var domainType = input.widgetOptions[ action ].forms[ input.selectedIndexType ].rdfType
                  unloadResourceForDomain(domainType)
                }
              }
            })
          }
        }
      })
      if (changes) {
        ractive.update()
      }
    }

    var unloadResourceForDomain = function (domainType) {
      _.each(allInputs(), function (input) {
        if (input.domain && domainType === unPrefix(input.domain)) {
          let subjectType = input.values[ 0 ].subjectType
          input.values = emptyValues(input.type === 'select-predefined-value', input.searchable)
          input.values[ 0 ].subjectType = subjectType
          input.values[ 0 ].oldSubjectType = subjectType
        } else if (input.isSubInput && input.parentInput.domain && domainType === unPrefix(input.parentInput.domain)) {
          var valuesToRemove = []
          _.each(input.values, function (value, index) {
            if (value.subjectType === domainType) {
              valuesToRemove.push(index)
            }
          })
          var promises = []
          _.each(valuesToRemove.reverse(), function (index) {
            promises.push(ractive.splice(`${input.keypath}.values`, index, 1))
          })
          Promise.all(promises).then(function () {
            let values = ractive.get(`${input.keypath}.values`)
            if (values.length === 0) {
              ractive.set(`${input.keypath}.values.0`, emptyValues(input.searchable))
              if (input.parentInput.subjectTypes.length === 1) {
                ractive.set(`${input.keypath}.values.0.subjectType`, input.parentInput.subjectTypes[ 0 ])
              }
            }
          })
        }
      })
      ractive.update()
      ractive.set('targetUri.' + domainType, undefined)
      updateBrowserLocationWithUri(domainType, undefined)
    }

    var deleteResource = function (uri, deleteConfig, success) {
      if (!deleteConfig.dialogKeypath) {
        deleteConfig.dialogKeypath = 'deleteResourceDialog'
        ractive.update()
      }
      deleteConfig.dialogId = deleteConfig.dialogId || 'delete-resource-dialog'
      axios.get(proxyToServices(`${uri}/references`)).then(function (response) {
        var totalNumberOfReferences = 0
        _.each(_.values(response.data), function (referenceCountForType) {
          totalNumberOfReferences += referenceCountForType
        })
        if (totalNumberOfReferences > 0) {
          ractive.set(`${deleteConfig.dialogKeypath}.references`, totalNumberOfReferences)
        }
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
              class: 'default',
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
            $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
          }
        })
      })
    }

    var enableSpecialInput = function (enableSpecialInputSpec) {
      ractive.set('confirmEnableSpecialInputDialog.confirmLabel', enableSpecialInputSpec.confirmLabel)
      let keypath = ractive.get(`inputLinks.${enableSpecialInputSpec.inputId}`)
      $('#confirm-enable-special-input-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        title: enableSpecialInputSpec.buttonLabel,
        buttons: [
          {
            text: 'Fortsett',
            click: function () {
              ractive.set(`${keypath}.visible`, true)
              $(this).dialog('close')
            }
          },
          {
            text: 'Avbryt',
            click: function () {
              $(this).dialog('close')
            }
          }
        ]
      })
    }

    var mergeResources = function (mergeResourcesSpec, targetUri, sourceUri, proceed) {
      axios.get(proxyToServices(`${sourceUri}/references`)).then(function (response) {
        ractive.set('mergeResourcesWarning', {
          linksThatWillBeMoved: _
            .chain(response.data)
            .values()
            .reduce(function (memo, num) { return memo + num }, 0)
            .value()
        })
        $('#merge-resources-dialog').dialog({
          resizable: false,
          modal: true,
          width: 450,
          title: 'Slå sammen autoriteter',
          buttons: [
            {
              text: 'Fortsett',
              click: function () {
                $(this).dialog('close')
                proceed()
              }
            },
            {
              text: 'Avbryt',
              class: 'default',
              click: function () {
                $(this).dialog('close')
              }
            }
          ],
          open: function () {
            $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
          }
        })
      })
    }

    var cloneParents = function (cloneParentSpec, parentUri, proceed) {
      $('#clone-parent-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        title: cloneParentSpec.cloneParentDialogTitle,
        buttons: [
          {
            text: 'Fortsett',
            click: function () {
              $(this).dialog('close')
              proceed()
            }
          },
          {
            text: 'Avbryt',
            class: 'default',
            click: function () {
              $(this).dialog('close')
            }
          }
        ],
        open: function () {
          $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
        }
      })
    }

    var warnEditResourceName = function (editResourcesSpec) {
      ractive.set('editResourceWarning', editResourcesSpec)
      $('#edit-resource-warning-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        title: `Endre ${editResourcesSpec.fieldLabel}?`,
        buttons: [
          {
            text: 'Fortsett',
            click: function () {
              $(this).dialog('close')
              editResourcesSpec.proceed()
            }
          },
          {
            text: 'Avbryt',
            class: 'default',
            click: function () {
              editResourcesSpec.revert()
              $(this).dialog('close')
            }
          }
        ],
        open: function () {
          $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
        }
      })
    }

    var alertAboutExistingResource = function (spec, existingResources, proceed) {
      ractive.set('existingResourcesDialog.existingResources', existingResources)
      ractive.set('existingResourcesDialog.legend', existingResources.length > 1 ? spec.legendPlural.replace('${numberOfResources}', existingResources.length) : spec.legendSingular)
      ractive.set('existingResourcesDialog.editResourceConfig', spec.editWithTemplate)
      $('#alert-existing-resource-dialog').dialog({
        resizable: false,
        modal: true,
        width: 550,
        title: 'Denne utgivelsen finnes fra før',
        class: 'existing-resources-dialog',
        buttons: [
          {
            text: 'Fortsett',
            click: function () {
              $(this).dialog('close')
              proceed()
            }
          },
          {
            text: 'Avbryt',
            class: 'default',
            click: function () {
              $(this).dialog('close')
              Main.restart()
            }
          }
        ],
        open: function () {
          $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
        }
      })
      ractive.set('existingResourcesDialog.dialogCloser', function () {
        $('#alert-existing-resource-dialog').dialog('close')
      })
    }

    var alertAboutAdditionalSuggestions = function (spec, proceed) {
      ractive.set('additionalSuggestionsDialog', spec)
      $('#additional-suggestions-dialog').dialog({
        resizable: false,
        modal: true,
        width: 550,
        title: 'Forslag til forhåndsfylte verdier',
        class: 'additionl-suggestions-dialog',
        buttons: [
          {
            text: 'Bruk forslag',
            class: 'default',
            click: function () {
              $(this).dialog('close')
              proceed(ractive.get('additionalSuggestionsDialog.allowPartialSuggestions'))
            }
          },
          {
            text: 'Ignorer',
            click: function () {
              $(this).dialog('close')
            }
          }
        ],
        open: function () {
          $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
        },
        close: function () {
          ractive.set(`inputGroups.${spec.group}.additionalSuggestions`, null)
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

    function sequentialPromiseResolver (promises) {
      let promise = promises.shift()
      if (promise) {
        promise.then(sequentialPromiseResolver(promises))
      }
    }

    function fragmentPartOf (predicate) {
      return typeof predicate === 'string' ? _.last(predicate.split('#')) : predicate
    }

    function setSuggestionsAreAcceptedForParentInput (input, index) {
      if (input.isSubInput) {
        input.parentInput.hasAcceptedSuggestions = input.parentInput.hasAcceptedSuggestions || []
        input.parentInput.hasAcceptedSuggestions[ index ] = true
      }
    }

    function setMultiValues (values, input, index, options) {
      options = options || {}
      if (values && values.length > 0) {
        var valuesAsArray = values.length === 0 ? [] : _.map(values, function (value) {
          return value.id
        })
        if (options.compareValues) {
          input.compareValues = input.compareValues || emptyValues()
        }
        let valuesKey = options.compareValues ? 'compareValues' : 'values'
        if (!input[ valuesKey ][ index ]) {
          input[ valuesKey ][ index ] = {}
        }
        input[ valuesKey ][ index ].old = {
          value: valuesAsArray
        }
        input[ valuesKey ][ index ].current = {
          value: valuesAsArray,
          uniqueId: _.uniqueId()
        }
        input[ valuesKey ][ index ].uniqueId = _.uniqueId()
        if (options.onlyValueSuggestions) {
          input[ valuesKey ][ index ].suggested = { source: options.source }
          input.suggestedValues = valuesAsArray
        } else if (options.source) {
          input[ valuesKey ][ index ].current.accepted = { source: options.source }
          setSuggestionsAreAcceptedForParentInput(input, index)
        }
        ractive.update(`${input.keypath}.values.${index}`)
        return valuesAsArray
      }
    }

    function setSingleValue (value, input, index, options) {
      options = options || {}
      if (options.compareValues) {
        input.compareValues = input.compareValues || emptyValues()
      }
      if (value) {
        input[ options.compareValues ? 'compareValues' : 'values' ][ index ] = {
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
        if (input[ options.compareValues ? 'compareValues' : 'values' ][ index ].current.accepted) {
          setSuggestionsAreAcceptedForParentInput(input, index)
        }
        ractive.update(`${input.keypath}.${options.compareValues ? 'compareValues' : 'values'}.${index}`)
      }
    }

    function setIdValue (id, input, index, valuesField) {
      input[ valuesField ] = input[ valuesField ] || []
      if (!input[ valuesField ][ index ]) {
        input[ valuesField ][ index ] = {}
      }
      input[ valuesField ][ index ].old = {
        value: id
      }
      input[ valuesField ][ index ].current = {
        value: id
      }
      input[ valuesField ][ index ].uniqueId = _.uniqueId()
      ractive.update(`${input.keypath}.${valuesField}.${index}`)
    }

    function valuePropertyFromNode (node) {
      return function (propNameCore) {
        let propVal = (node.getAll(propNameCore)[ 0 ] || { value: undefined }).value
        if (propVal === undefined) {
          propVal = (node.outAll(propNameCore)[ 0 ] || { 'id': undefined }).id
        }
        return propVal
      }
    }

    function setDisplayValue (input, index, root, options) {
      options = options || {}
      let valuesField = options.valuesField || 'values'
      var uri = input[ valuesField ][ index ].current.value
      if (input.type === 'searchable-authority-dropdown') {
        uri = uri[ 0 ]
      }

      function fromRoot (root) {
        function getValues (onlyFirstField) {
          return _.pluck(getDisplayProperties(input.nameProperties || [ 'name', 'prefLabel' ], valuePropertyFromNode(root), indexTypeFromNode(root)) || [], 'val')
            .slice(onlyFirstField ? 0 : undefined, onlyFirstField ? 1 : undefined)
            .join(' ').replace(/[,]$/, '').replace(/– /, '–').replace(/–(?=[^0-9])/, '– ')
        }

        var values = getValues(options.onlyFirstField)
        var typeMap = ractive.get('applicationData.config.typeMap')
        var selectedIndexType
        _.each(input.indexTypes, function (indexType) {
          if (root.isA(typeMap[ indexType ])) {
            selectedIndexType = indexType
          }
        })
        if ((options.onlyFirstField || (input.nameProperties || []).length === 1) && /^\[.*\]$/.test(values)) {
          input[ valuesField ][ index ].bracketed = true
          values = values.replace('[', '').replace(']', '')
        }

        var multiple = input.isSubInput ? input.parentInput.multiple : input.multiple
        if (options.onlyValueSuggestions) {
          if (multiple) {
            input[ valuesField ][ index ].suggested = {
              source: options.source,
              selectedIndexType: selectedIndexType
            }
            input[ valuesField ][ index ].current.displayValue = values
          } else {
            input.suggestedValues = input.suggestedValues || []
            input.suggestedValues[ index ] = {
              value: values,
              displayValue: getValues(),
              source: options.source,
              selectedIndexType: selectedIndexType
            }
          }
        } else {
          input[ valuesField ][ index ] = input[ valuesField ][ index ] || {}
          input[ valuesField ][ index ].current = input[ valuesField ][ index ].current || {}
          input[ valuesField ][ index ].current.displayValue = values
          if (options.source) {
            input[ valuesField ][ index ].current.accepted = {
              source: options.source,
              selectedIndexType: selectedIndexType
            }
          }
        }
        ractive.update(`${input.keypath}.${valuesField}.${index}`)
      }

      if (isBlankNodeUri(uri)) {
        if (root) {
          fromRoot(root)
        }
        return Promise.resolve()
      } else {
        return axios.get(proxyToServices(uri), {
            headers: {
              Accept: 'application/ld+json'
            }
          }
        ).then(function (response) {
          var graphData = ensureJSON(response.data)
          var root = ldGraph.parse(graphData).byId(uri)
          fromRoot(root)
        })
      }
    }

    function checkShouldInclude (input, allInputs,) {
      var shouldInclude = true
      let handleInput = function (includeWhenValues, property) {
        return function (input) {
          if (input.fragment === property && !_.contains(includeWhenValues, _.flatten([
              fragmentPartOf(URI.parseQuery(document.location.href)[ property ] ||
                _.flatten([ input.values[ 0 ].current.value ])[ 0 ])
            ])[ 0 ])) {
            shouldInclude = false
            return true
          }
        }
      }
      if (input.includeOnlyWhen) {
        _.each(_.keys(input.includeOnlyWhen), function (property) {
          let includeWhenValues = _.flatten([ input.includeOnlyWhen[ property ] ])
          if (allInputs) {
            _.find(allInputs, handleInput(includeWhenValues, property))
          } else {
            forAllGroupInputs(handleInput(includeWhenValues, property))
          }
        })
      }
      return shouldInclude
    }

    function advancedSearchCharacters () {
      return ':+-^()´"*'
    }

    function updateBrowserLocationWithUri (type, resourceUri) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      const prefix = type.startsWith('compare_with_') ? 'compare_with_' : ''
      var triumphRanking = { [`${prefix}Work`]: 1, [`${prefix}Publication`]: 2 }
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
      ractive.set('openTab', '' + (tabNumber || '0'))
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

    function updateBrowserLocationClearAllExcept (keep) {
      var oldUri = URI.parse(document.location.href)
      var queryParameters = URI.parseQuery(oldUri.query)
      for (let param in queryParameters) {
        if (!keep.includes(param)) {
          delete queryParameters[ param ]
        }
      }
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
            promises.push(axios.get(proxyToServices(uri), {
                headers: {
                  Accept: 'application/ld+json'
                }
              }
            ).then(function (response) {
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

    function allTopLevelGroupInputsForDomain (domain) {
      return _
        .chain(ractive.get('inputGroups'))
        .pluck('inputs')
        .flatten()
        .filter(function (input) {
          return input.domain && !input.isSubInput && unPrefix(input.domain) === domain
        })
        .value()
    }

    function forAllGroupInputs (handleInput, options) {
      options = options || {}
      _.find(options.inputGroups || ractive.get('inputGroups'), function (group, groupIndex) {
        return _.find(group.inputs, function (input, inputIndex) {
          if (input.subInputs) {
            if (options.handleInputGroups) {
              handleInput(input, groupIndex, inputIndex)
            }
            return _.find(input.subInputs, function (subInput, subInputIndex) {
              return handleInput(subInput.input, groupIndex, inputIndex, subInputIndex)
            })
          } else {
            return handleInput(input, groupIndex, inputIndex)
          }
        })
      })
    }

    function allInputs () {
      var inputs = _.select(ractive.get('inputs'), function (input) {
        return (input.fragment === 'publicationOf' || input.fragment === 'recordId')
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

      forAllGroupInputs(addInput)

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
        return (input.fragment === 'publicationOf' && input.domain === 'deichman:Publication' && input.type === 'searchable-with-result-in-side-panel')
      })
      if (publicationOfInput) {
        handler(publicationOfInput)
      }
    }

    function inputFromInputId (inputId) {
      let keypath = ractive.get(`inputLinks.${inputId}`)
      if (keypath) {
        return ractive.get(keypath)
      }
    }

    function typeFromUri (resourceUri) {
      var typeMap = ractive.get('applicationData.config.typeMap')
      return typeMap[ resourceUri.match(`^.*\/(${_.keys(typeMap).join('|')})\/.*$`)[ 1 ] ]
    }

    function getDisplayProperties (properties, valueFromPropertyFunc, type) {
      var parensStarted

      function checkEndParens (propName, ornamented) {
        if (parensStarted && propName.indexOf(')') !== -1) {
          ornamented += ')'
          parensStarted = false
        }
        return ornamented
      }

      function ornament (unornamented, propName) {
        var ornamented = unornamented
        var checkEndPunctuation = false
        _.each([ '.', ',', '/', ':' ], function (seperator) {
          if (propName.lastIndexOf(seperator) >= propName.length - 2) {
            ornamented += seperator
            checkEndPunctuation = true
          }
          if (propName.lastIndexOf(seperator) === 0) {
            ornamented = seperator + ' ' + unornamented
          }
        })
        if (propName.indexOf('(') === 0) {
          ornamented = '(' + ornamented
          parensStarted = true
        }
        if (propName.indexOf('-') !== -1) {
          ornamented += '–'
        }
        ornamented = checkEndParens(propName, ornamented)
        if (checkEndPunctuation && /.\)$/.test(ornamented)) {
          ornamented = ornamented.replace('.)', ').')
        }
        return ornamented
      }

      var displayProperties
      _.each(properties, function (propSpec) {
        var propName
        if (typeof propSpec === 'object') {
          propName = propSpec[ _.find(_.keys(propSpec), function (key) { return new RegExp(key).test(type) }) ]
        } else {
          propName = propSpec
        }
        if (propName) {
          var propNameCore = propName.split(/\.fragment|[#\.,:\(\)-]/).join('')
          var propVal = valueFromPropertyFunc(propNameCore)

          if (propVal && propVal !== '') {
            displayProperties = displayProperties || []
            let property = { prop: propNameCore }
            var ornamented
            if (propName.indexOf('.fragment') !== -1) {
              ornamented = ornament(fragmentPartOf(propVal), propName)
            } else {
              ornamented = ornament(propVal, propName)
            }
            if (propName.indexOf('#') === 0 && displayProperties.length > 0) {
              let previousPropVal = _.last(displayProperties).val
              _.last(displayProperties).val = previousPropVal.replace(/,$/, '')
            }
            property.val = ornamented
            displayProperties.push(property)
          } else {
            let endParensVal = checkEndParens(propName, '')
            if (endParensVal !== '') {
              displayProperties.push({ val: endParensVal })
            }
          }
        }
      })
      return displayProperties
    }

    function indexTypeFromNode (node) {
      var indexType
      var typeMap = ractive.get('applicationData.config.typeMap')
      _.each(_.keys(typeMap), function (typeMapKey) {
        if (node.isA(typeMap[ typeMapKey ])) {
          indexType = typeMapKey
        }
      })
      return indexType
    }

    function setPreviewValues (input, node, index) {
      input.values[ index ].previewProperties = getDisplayProperties(input.previewProperties || [], valuePropertyFromNode(node), indexTypeFromNode(node))
    }

    function these (collection) {
      return {
        orIf: function (when) {
          return {
            atLeast: function (value) {
              return when ? (collection.length > 0 ? collection : value) : collection
            }
          }
        }
      }
    }

    function sortNodes (roots, sortOrder, type) {
      return _.sortBy(roots, function (node) {
        return _.chain(sortOrder).map(function (sortSpec) {
          const value = (node.getAll(sortSpec.predicate)[ 0 ] || {}).value
          return sortSpec.isNumber ? (`000${value}`).slice(-4) : value || ''
        }).value().join('|')
      })
    }

    function removeInputsForObject (parentInput, index, event) {
      return function () {
        ractive.update()
        var promises = []
        promises.push(ractive.set(`${parentInput.keypath}.unFinished`, true))
        _.each(parentInput.subInputs, function (subInput) {
          if (_.isArray(subInput.input.values)) {
            try {
              promises.push(ractive.splice(`${subInput.input.keypath}.values`, index, 1))
            } catch (e) {
              // nop
            }
          }
        })
        if (event) {
          promises.push(new Promise(function () {
            $(event.node).closest('.ui-accordion-content').prev().remove()
            $(event.node).closest('.ui-accordion-content, .field').remove()
          }))
        }
        promises.push(ractive.set(`${parentInput.keypath}.unFinished`, false))
        sequentialPromiseResolver(promises)
        if (ractive.get(`${parentInput.keypath}.subInputs.0.input.values`).length === 0) {
          var addValueEvent = { keypath: parentInput.keypath }
          ractive.fire('addValue', addValueEvent)
        }
      }
    }

    function updateInputsForResource (response, resourceUri, options, root, type) {
      options = options || {}
      const valuesField = options.compareValues ? 'compareValues' : 'values'
      const graphData = ensureJSON(response.data)
      const offsetCrossTypes = { 'Work': 'Publication', 'Publication': 'Work' }
      type = type || typeFromUri(resourceUri)
      root = root || ldGraph.parse(graphData).byId(resourceUri)
      if (!ractive.get('lastRoots')) {
        ractive.set('lastRoots', {})
      }

      let inputs = options.inputs || allInputs()
      let promises = []
      let skipRest = false
      let parentInputRootsCache = {}
      _.each([ true, false ], function (onlyDoSuggestionForCreateNewResource) {
        _.each(inputs, function (input, index) {
          if (!skipRest &&
            ((input.domain && type === unPrefix(input.domain) || _.contains((input.subjects), type)) ||
            (input.isSubInput && (type === input.parentInput.domain || _.contains(input.parentInput.subjectTypes, type))) ||
            (options.onlyValueSuggestions && input.suggestValueFrom && type === unPrefix(input.suggestValueFrom.domain)))) {
            let ownerInput = inputFromInputId(input.belongsToCreateResourceFormOfInput)
            if (ownerInput && ownerInput.domain &&
              input.belongsToCreateResourceFormOfInput &&
              ((input.targetResourceIsMainEntry || false) === (options.wrapperObject && options.wrapperObject.isA('MainEntry')) || false) &&
              (unPrefix(ownerInput.domain) === options.wrappedIn || !options.wrappedIn) &&
              (options.wrapperObject && options.wrapperObject.isA(options.wrappedIn) || !options.wrapperObject)) {
              let inputParentOfCreateNewResourceFormKeypath = ractive.get(`inputLinks.${input.belongsToCreateResourceFormOfInput}`)
              ractive.push(`${inputParentOfCreateNewResourceFormKeypath}.suggestedValuesForNewResource`, root)
              skipRest = true
            } else {
              if (!onlyDoSuggestionForCreateNewResource) {
                const rangeStart = (options.range || {}).start || 0
                const rangeLength = (options.range || {}).rangeLength || ((input.parentInput || {}).pagination || 10000)
                const loadForRangeOfInputs = function (startIndex, rangeLength) {
                  return function (_root) {
                    _root = _root || root
                    input.offset = input.offset || {}
                    let offset = 0
                    if (input.offset[ offsetCrossTypes[ type ] ]) {
                      offset = input.offset[ offsetCrossTypes[ type ] ]
                    }
                    const predicate = options.onlyValueSuggestions && input.suggestValueFrom ? input.suggestValueFrom.predicate : input.predicate

                    let actualRoots
                    if (input.isSubInput) {
                      const cachedRoot = (parentInputRootsCache[ resourceUri ] || {})[ fragmentPartOf(input.parentInput.predicate) ]
                      if (cachedRoot) {
                        actualRoots = cachedRoot.outAll(fragmentPartOf(input.parentInput.predicate))
                      } else {
                        actualRoots = (ractive.get('lastRoots')[ resourceUri ] || {})[ fragmentPartOf(input.parentInput.predicate) ] || _root.outAll(fragmentPartOf(input.parentInput.predicate))
                        parentInputRootsCache[ resourceUri ] = parentInputRootsCache[ resourceUri ] || {}
                        parentInputRootsCache[ resourceUri ][ input.parentInput.predicate ] = actualRoots
                      }
                    } else {
                      actualRoots = [ _root ]
                    }
                    let rootIndex = 0
                    _.each(_.filter(input.parentInput && input.parentInput.objectSortOrder ? sortNodes(actualRoots, input.parentInput.objectSortOrder) : actualRoots, function (root, index) {
                      return index >= startIndex && index < (startIndex + (rangeLength))
                    }), function (root) {
                      let index
                      const mainEntryInput = (input.parentInput && input.parentInput.isMainEntry === true) || (input.targetResourceIsMainEntry === true) || false
                      const mainEntryNode = (root.isA('MainEntry') === true) || ((options.wrapperObject && options.wrapperObject.isA('MainEntry') === true) || false)
                      if (options.overrideMainEntry || mainEntryInput === mainEntryNode) {
                        if (_.contains([ 'select-authorized-value', 'entity' ], input.type)) {
                          index = 0
                          let values = setMultiValues(root.outAll(fragmentPartOf(predicate)), input, rootIndex)
                          promises = promises.concat(loadLabelsForAuthorizedValues(values, input, 0, root))
                        } else if (input.type === 'searchable-with-result-in-side-panel' || input.type === 'searchable-authority-dropdown') {
                          if (!(input.suggestValueFrom && options.onlyValueSuggestions)) {
                            _.each(these(root.outAll(fragmentPartOf(predicate))).orIf(input.isSubInput).atLeast([ { id: '' } ]), function (node, multiValueIndex) {
                              index = (input.isSubInput ? rootIndex : multiValueIndex) + (offset)
                              setIdValue(input.type === 'searchable-authority-dropdown' ? [ node.id ] : node.id, input, index, valuesField)
                              if (options.source && node.id !== '') {
                                setPreviewValues(input, node, index)
                              }
                              if (!options.onlyValueSuggestions) {
                                if (options.source) {
                                  input[ valuesField ][ index ].searchable = true
                                } else {
                                  input[ valuesField ][ index ].searchable = false
                                }
                                if (node.id !== '') {
                                  promises.push(setDisplayValue(input, index, node, _.extend(options, {
                                    onlyFirstField: options.source,
                                    valuesField
                                  })))
                                  if (!isBlankNodeUri(node.id)) {
                                    ractive.set(`${input.keypath}.${valuesField}.${index}.deletable`, true)
                                    if (input.isSubInput && !options.source) {
                                      input.parentInput.allowAddNewButton = true
                                      input[ valuesField ][ index ].nonEditable = true
                                      ractive.set(`${input.keypath}.${valuesField}.${index}.nonEditable`, true)
                                      ractive.set(`${input.parentInput.keypath}.subInputs.0.input.${valuesField}.${index}.nonEditable`, true)
                                    }
                                  }
                                }
                                setAllowNewButtonForInput(input)
                              } else {
                                setDisplayValue(input, index, node, _.extend(options, {
                                  onlyFirstField: options.source,
                                  valuesField
                                }))
                                input[ valuesField ][ index ].searchable = true
                              }
                              input[ valuesField ][ index ].subjectType = type
                              input[ valuesField ][ index ].oldSubjectType = type
                              ractive.update(`${input.keypath}.${valuesField}.${index}`)
                            })
                          } else {
                            _.each(root.getAll(fragmentPartOf(predicate)), function (node, multiValueIndex) {
                              input.suggestedValues = input.suggestedValues || []
                              input.suggestedValues.push({
                                value: node.value,
                                source: options.source
                              })
                            })
                          }
                        } else if (input.type === 'select-predefined-value') {
                          if (!options.onlyValueSuggestions) {
                            setMultiValues(these(root.outAll(fragmentPartOf(predicate))).orIf(input.isSubInput || options.compareValues).atLeast([ { id: '' } ]), input, (input.isSubInput ? rootIndex : 0) + (offset), options)
                            if (input.isSubInput && !options.source) {
                              input[ valuesField ][ rootIndex + (offset) ].nonEditable = true
                              ractive.update(`${input.keypath}.${valuesField}.${rootIndex + (offset)}`)
                              ractive.set(`${input.keypath}.${valuesField}.${rootIndex + (offset)}.nonEditable`, true)
                            }
                          } else {
                            var multiple = input.isSubInput ? input.parentInput.multiple : input.multiple
                            _.each(root.outAll(fragmentPartOf(predicate)), function (value) {
                              if (input.isSubInput && multiple) {
                                setMultiValues(root.outAll(fragmentPartOf(predicate)), input, (input.isSubInput ? rootIndex : 0) + (offset), options)
                                input[ valuesField ][ (input.isSubInput ? rootIndex : 0) + (offset) ].nonEditable = true
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
                          _.each(root.outAll(fragmentPartOf(predicate)), function (value) {
                            setIdValue(value.id, input, 0, valuesField)
                          })
                        } else {
                          _.each(these(root.getAll(fragmentPartOf(predicate))).orIf(input.isSubInput || options.compareValues).atLeast([ { value: '' } ]), function (value, index) {
                            if (!options.onlyValueSuggestions) {
                              let valueIndex = input.isSubInput ? rootIndex : index
                              setSingleValue(value, input, (valueIndex) + (offset), _.extend(options, { setNonEditable: input.isSubInput && !options.source }))
                              input[ valuesField ][ valueIndex ].subjectType = type
                              input[ valuesField ][ valueIndex ].oldSubjectType = type
                              if (input.isSubInput && !options.source) {
                                input[ valuesField ][ valueIndex ].nonEditable = true
                                ractive.set(`${input.parentInput.keypath}.subInputs.0.input.${valuesField}.${valueIndex}.nonEditable`, true)
                                input.parentInput.allowAddNewButton = true
                              }
                              ractive.set(`${input.keypath}.allowAddNewButton`, true)
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
                    input.offset[ type ] = _.flatten(_.compact(_.pluck(_.pluck(input[ valuesField ], 'current'), 'value'))).length

                    ractive.set(`${input.keypath}.nextRange`, actualRoots.length > startIndex + rangeLength ? loadForRangeOfInputs(startIndex + rangeLength, rangeLength) : null)
                    ractive.set(`${input.keypath}.prevRange`, startIndex > 0 ? loadForRangeOfInputs(Math.max(startIndex - rangeLength, 0), rangeLength) : null)
                    ractive.set(`${input.keypath}.thisRange`, loadForRangeOfInputs(startIndex, rangeLength))
                    ractive.set(`${input.keypath}.customRange`, loadForRangeOfInputs)
                    if (input.parentInput && input.parentInput.pagination && input.keypath.endsWith('0.input')) {
                      ractive.set(`${input.keypath}.rangeStats`, {
                        start: startIndex + 1,
                        end: Math.min(actualRoots.length, startIndex + rangeLength),
                        numberOfObjects: actualRoots.length,
                        rangeLength
                      })
                    }
                    if (actualRoots.length > rangeLength && input.parentInput && input.parentInput.pagination) {
                      const fromEnd = actualRoots.length - startIndex
                      ractive.splice(`${input.keypath}.${valuesField}`, fromEnd, Math.max(input.parentInput.pagination - fromEnd, 0))
                    }
                    return true
                  }
                }
                loadForRangeOfInputs(rangeStart, rangeLength)(root)
                if (input.parentInput) {
                  input.parentInput.nextRanges = []
                  input.parentInput.prevRanges = []
                }
              }
            }
          }
        })
      })
      Promise.all(promises).then(function () {
        if (!options.deferUpdate || promises.length > 0) {
          ractive.update()
        }
        if (!(options.keepDocumentUrl)) {
          ractive.set('save_status', 'åpnet eksisterende ressurs')
          if (!(options || {}).compareValues) {
            ractive.set(`targetUri.${type}`, resourceUri)
          }
          updateBrowserLocationWithUri((options.compareValues ? 'compare_with_' : '') + type, resourceUri)
        }
      })
    }

    var fetchExistingResource = function (resourceUri, options) {
      options = options || {}
      return axios.get(proxyToServices(resourceUri), {
          headers: {
            Accept: 'application/ld+json'
          }
        }
      )
        .then(function (response) {
            updateInputsForResource(response, resourceUri, options)
            ractive.set(`targetUri.${options.compareValues ? 'compare_with_' : ''}${typeFromUri(resourceUri)}`, resourceUri)
          }
        )
        .catch(function (err) {
          console.log(`HTTP GET ${resourceUri} existing resource failed with:`)
          console.log(err)
        })
    }

    function saveInputs (inputsToSave, resourceType) {
      let wait = ractive.get('waitHandler').thisMayTakeSomTime()
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
      let uri = ractive.get('config.resourceApiUri')
      let lowerCaseResourceType = resourceType.toLowerCase()
      let resourceTypeAlias = ractive.get('config.resourceTypeAliases')[ lowerCaseResourceType ] || lowerCaseResourceType
      return axios.post(`${uri}${resourceTypeAlias}`,
        {}, { headers: { Accept: 'application/ld+json', 'Content-Type': 'application/ld+json' } })
        .then(function (response) {
          var resourceUri = response.headers.location
          let patchBatch = []
          _.each(inputsToSave, function (input) {
            var predicate = input.predicate
            _.each(input.values, function (value) {
              var patches = Ontology.createPatch(resourceUri, predicate, value, input.datatypes[ 0 ])
              _.each(patches, function (patch) {
                patchBatch.push(patch)
              })
              value.old = deepClone(value.current)
            })
          })
          if (patchBatch.length > 0) {
            executePatch(resourceUri, patchBatch, undefined, errors)
          }
          ractive.update().then(function () {
            if (wait) {
              wait.done()
            }
          })
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
      return axios.get(proxyToServices(url), {
          headers: {
            Accept: 'application/ld+json'
          }
        }
      )
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
        old: { value: predefined ? [] : undefined, lang: '' },
        current: { value: predefined ? [] : undefined, lang: '', displayValue: '' },
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
      input.visible = (prop.type !== 'entity' && prop.type !== 'hidden-url-query-value' && !prop.initiallyHidden)
      if (prop.nameProperties) {
        input.nameProperties = prop.nameProperties
      }
      if (prop.previewProperties) {
        input.previewProperties = prop.previewProperties
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
        input.supportable = true
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
      if (prop.dependentResourceTypes) {
        input.dependentResourceTypes = prop.dependentResourceTypes
      }
    }

    var lastFoundOrActualLast = function (lastIndexOfVisible, numberOfInputs) {
      return lastIndexOfVisible === -1 ? numberOfInputs - 1 : lastIndexOfVisible
    }

    var markFirstAndLastInputsInGroup = function (group) {
      for (var ix = 0; ix < group.inputs.length; ix++) {
        group.inputs[ ix ].firstInGroup = undefined
        group.inputs[ ix ].lastInGroup = undefined
      }
      // _.each(group.inputs, function (input) {
      //   // delete input.firstInGroup
      //   // delete input.lastInGroup
      // })
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
        case 'http://www.w3.org/2001/XMLSchema#dateTime':
          inputType = 'input-date-time'
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
        case 'deichman:WorkSeries' :
        case 'deichman:WorkSeriesPart':
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
      var inputsForDomainType = {}
      applicationData.predefinedValues = {}
      applicationData.predefVals = {}
      applicationData.allLabels = {}
      applicationData.propertyLabels = {}
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
          let label = i18nLabelValue(props[ i ][ 'rdfs:label' ])
          applicationData.propertyLabels[ fragment ] = label
          var input = {
            disabled: disabled,
            predicate: predicate,
            fragment: fragment,
            predefined: predefined,
            ranges: datatypes,
            datatypes: datatypes,
            label: label,
            domain: domain,
            allowAddNewButton: false,
            values: emptyValues(predefined),
            dataAutomationId: unPrefix(domain) + '_' + predicate + '_0',
            visible: true
          }

          if (input.predefined) {
            input.type = 'select-predefined-value'
            input.datatypes = [ 'http://www.w3.org/2001/XMLSchema#anyURI' ]
          } else {
            assignInputTypeFromRange(input)
          }
          inputs.push(input)
          inputMap[ unPrefix(domain) + '.' + input.predicate ] = input
          inputsForDomainType[ unPrefix(domain) ] = inputsForDomainType[ unPrefix(domain) ] || []
          inputsForDomainType[ unPrefix(domain) ].push(input)
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
          allowAddNewButton: false,
          subInputs: [],
          predicate: ontologyUri + compoundInput.subInputs.rdfProperty,
          ranges: compoundInput.subInputs.ranges,
          range: compoundInput.subInputs.range,
          inputGroupRequiredVetoes: [],
          accordionHeader: compoundInput.subInputs.accordionHeader,
          pagination: compoundInput.subInputs.pagination,
          objectSortOrder: compoundInput.subInputs.objectSortOrder,
          orderBy: compoundInput.subInputs.orderBy,
          id: compoundInput.id,
          keypath: compoundInput.keypath
        }
        if (compoundInput.subInputs.objectSortOrder) {
          applicationData.sortOrders = applicationData.sortOrders || []
          applicationData.sortOrders.push({
            predicate: compoundInput.subInputs.rdfProperty,
            objectSortOrder: compoundInput.subInputs.objectSortOrder
          })
        }
        _.each(compoundInput.subInputs.inputs, function (subInput, subInputIndex) {
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
              supportable: type === 'searchable-with-result-in-side-panel',
              showOnlyWhen: subInput.showOnlyWhen,
              isTitleSource: subInput.isTitleSource,
              subInputIndex: subInputIndex,
              keypath: `${compoundInput.keypath}.subInputs.${subInputIndex}.input`,
              previewProperties: subInput.previewProperties
            }),
            parentInput: currentInput
          }

          copyResourceForms(newSubInput.input, compoundInput.isMainEntry)

          if (type === 'searchable-with-result-in-side-panel') {
            newSubInput.input.values[ 0 ].searchable = true
          }
          if (_.isArray(currentInput.subjectTypes) && currentInput.subjectTypes.length === 1) {
            newSubInput.input.values[ 0 ].subjectType = currentInput.subjectTypes[ 0 ]
            newSubInput.input.values[ 0 ].subjectType = currentInput.subjectTypes[ 0 ]
            newSubInput.input.values[ 0 ].oldSubjectType = currentInput.subjectTypes[ 0 ]
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
                  _.extend(formInput, _.omit(ontologyInput, formInput.type ? 'type' : '', formInput.label ? 'label' : ''))
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
                  labelForCreateButton: resourceForm.labelForCreateButton,
                  prefillFromAcceptedSource: resourceForm.prefillFromAcceptedSource,
                  popupForm: true
                }
              })
            }
          })
        }
      }

      function createInputsForGroup (inputGroup, groupIndex) {
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
              isTitleSource: input.isTitleSource,
              searchMainResource: input.searchMainResource,
              supportable: true
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
              ontologyInput = inputMap[ inputGroup.rdfType + '.' + ontologyUri + input.rdfProperty ]
              ontologyInput.keypath = `inputGroups.${groupIndex}.inputs.${index}`
              ontologyInput.suggestedValuesForNewResource = []

              if (typeof ontologyInput === 'undefined') {
                throw new Error(`Group "${inputGroup.id} " specified unknown property "${input.rdfProperty}"`)
              }
              assignUniqueValueIds(ontologyInput)
              if (input.type === 'searchable-with-result-in-side-panel') {
                ontologyInput.values[ 0 ].searchable = true
              }
            } else if (input.subInputs) {
              input.keypath = `inputGroups.${groupIndex}.inputs.${index}`
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
            if (input.reportFormat) {
              ontologyInput.reportFormat = input.reportFormat
            }
            if (input.formatter) {
              ontologyInput.formatter = input.formatter
            }
            if (input.readOnly) {
              ontologyInput.readOnly = input.readOnly
            }
            if (input.oneLiner) {
              ontologyInput.oneLiner = input.oneLiner
            }
            if (input.label) {
              ontologyInput.label = input.label
            }
            if (input.showOnlyWhenInputHasValue) {
              ontologyInput.showOnlyWhenInputHasValue = input.showOnlyWhenInputHasValue
            }
          }
          copyResourceForms(input)
        })
        return groupInputs
      }

      var configInputsForVisibleGroup = function (inputGroup, index) {
        var group = { groupIndex: index }
        var groupInputs = createInputsForGroup(inputGroup, index)
        group.inputs = groupInputs
        group.tabLabel = inputGroup.label
        group.reportLabel = inputGroup.reportLabel
        group.tabId = inputGroup.id
        group.tabSelected = false
        group.domain = inputGroup.rdfType
        group.showOnlyWhenInputHasValue = inputGroup.showOnlyWhenInputHasValue
        group.tools = inputGroup.tools

        if (inputGroup.nextStep) {
          group.nextStep = inputGroup.nextStep
        }
        if (inputGroup.deleteResource) {
          group.deleteResource = inputGroup.deleteResource
        }
        if (inputGroup.enableSpecialInput) {
          group.enableSpecialInput = inputGroup.enableSpecialInput
        }

        group.handledAdditionalSuggestions = false
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

      var searchIndexForType = {}
      _.each(_.pairs(applicationData.config.rdfTypeToIndexType), function (pair) {
        searchIndexForType[ pair[ 0 ] ] = pair[ 1 ]
      })

      // sort arrays of inputs for each domain type according to order in corresponding forms
      var maintenanceForms = _.chain(applicationData.maintenanceInputs)
        .pluck('widgetOptions').pluck('enableCreateNewResource').compact().pluck('forms').value()

      _.each(maintenanceForms, function (form) {
        var formContent = _.chain(form).pairs().first().value()
        var inputOrderMap = {}
        var readonlyness = {}
        _.each(formContent[ 1 ].inputs, function (input, index) {
          inputOrderMap[ input.predicate ] = index
          if (input.readOnly) {
            readonlyness[ input.predicate ] = true
          }
        })
        var type = formContent[ 1 ].rdfType
        inputsForDomainType[ type ] = inputsForDomainType[ type ].sort(function (a, b) {
          return (inputOrderMap[ a.predicate ]) - (inputOrderMap[ b.predicate ])
        })
        _.each(inputsForDomainType[ type ], function (input) {
          if (readonlyness[ input.predicate ]) {
            input.readOnly = true
          }
        })
        searchIndexForType[ formContent[ 1 ].rdfType ] = formContent[ 0 ]
        applicationData.searchIndexForType = searchIndexForType
      })

      _.each(applicationData.config.tabs, function (tab) {
        delete inputsForDomainType[ tab.rdfType ]
      })

      _.each(_.values(inputsForDomainType), function (inputs) {
        markFirstAndLastInputsInGroup({ inputs: inputs })
      })

      forAllGroupInputs(function (input, groupIndex, inputIndex) {
        if (input.domain) {
          inputsForDomainType[ unPrefix(input.domain) ] = inputsForDomainType[ unPrefix(input.domain) ] || []
          inputsForDomainType[ unPrefix(input.domain) ].push(input)
        }
      }, { handleInputGroups: true, inputGroups: inputGroups })

      let flattenedInputsForDomainType = _.chain(inputsForDomainType).mapObject(function (inputs, domainType) {
        return _.chain(inputs).map(function (input) {
          return input.subInputs ? _.pluck(input.subInputs, 'input') : [ input ]
        }).flatten(true).value()
      }).value()

      applicationData.inputsForDomainType = inputsForDomainType
      applicationData.flattenedInputsForDomainType = flattenedInputsForDomainType

      return axios.all(predefinedValues).then(function (values) {
        _.each(values, function (predefinedValue) {
          if (predefinedValue) {
            applicationData.predefinedValues[ unPrefix(predefinedValue.property) ] = predefinedValue.values
            _.each(predefinedValue.values, function (predefVal) {
              applicationData.allLabels[ predefVal[ '@id' ] ] = i18nLabelValue(predefVal.label)
            })
          }
        })
        _.each(_.pairs(applicationData.propertyLabels), function (pair) {
          applicationData.allLabels[ `http://data.deichman.no/ontology#${pair[ 0 ]}` ] = pair[ 1 ]
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
      if (dummyPanel.length > 0) {
        var supportPanelLeftEdge = dummyPanel.position().left
        var supportPanelWidth = dummyPanel.width()
        $('span.support-panel').each(function (index, panel) {
          var supportPanelBaseId = $(panel).attr('data-support-panel-base-ref')
          var supportPanelBase = $(`span:visible[data-support-panel-base-id=${supportPanelBaseId}] div.search-input`)
          var offset = 15
          if (supportPanelBase.length === 0) {
            supportPanelBase = $(`span:visible[data-support-panel-base-id=${supportPanelBaseId}]`)
            offset = 0
          }
          if (supportPanelBase.length > 0) {
            $(panel).css({
              top: _.last(_.flatten([ supportPanelBase ])).position().top - offset,
              left: supportPanelLeftEdge,
              width: supportPanelWidth,
              'z-index': 100 - index
            })
          }
        })
      }
      return applicationData
    }

    function loadWorksAsSubject (target) {
      axios.get(proxyToServices(target.uri + '/asSubjectOfWorks'), {
          headers: {
            Accept: 'application/ld+json'
          }
        }
      ).then(function (response) {
        target.subItems = _.pluck(ensureJSON(response).data.hits.hits, '_source')
        target.subItemType = 'work'
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
        return input.searchForValueSuggestions && checkShouldInclude(input)
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
          contributionTarget.creator += ', ' + creatorAgent.birthYear + '–'
          if (creatorAgent.deathYear) {
            contributionTarget.creator += creatorAgent.deathYear
          }
          contributionTarget.creator
        }
      }
      return contributionTarget
    }

    function eventShouldBeIgnored (event) {
      return (event.original && event.original.type === 'keyup' && event.original.keyCode !== 13)
    }

    function stripHtml (html) {
      // trick to strip unwanted tags, attributes and stuff we get from
      // contenteditable inputs
      var txt = document.createElement('textarea')
      txt.innerHTML = html
      return txt.value
    }

    function doSearch (event, searchString, preferredIndexType, secondaryIndexType, loadWorksAsSubjectOfItem) {
      searchString = stripHtml(searchString).trim()

      if (!searchString) {
        if (ractive.get(event.keypath + '.searchResult.')) {
          ractive.set(event.keypath + '.searchResult.', null)
        }
        return
      }

      // secondaryIndexType is used when searching for subject as suggestion from external source
      var indexType = preferredIndexType || secondaryIndexType

      var config = ractive.get('config')

      // We have two kinds of searches:
      //   A) Searching in a sorted list of authority labels
      //   B) Searching in Elasticsearch with a structured search query
      //
      // The following variables will be populated depending on which kind of search we do:
      var searchURI
      var searchBody
      var axiosMethod

      var fieldForSortedListQuery = config.search[ indexType ].sortedListQueryForField
      if (fieldForSortedListQuery) {
        // A) Searching in sorted list
        axiosMethod = axios.get
        searchURI = searchURI = `${config.resourceApiUri}search/${config.search[ indexType ].type}/sorted_list?prefix=${searchString}&field=${fieldForSortedListQuery}&minSize=40`
      } else {
        // B) Searching in Elasticsearch
        indexType = config.search[ indexType ].type
        searchURI = `/search/${indexType}/_search`
        axiosMethod = axios.post

        // Determine if we are doing a mainEntry constrained search
        var inputkeyPath = grandParentOf(event.keypath)
        var filterArgInputRef = ractive.get(inputkeyPath + '.widgetOptions.filter.inputRef')
        var mainEntry
        if (filterArgInputRef) {
          mainEntry = _.find(allInputs(), function (input) {
            return filterArgInputRef === input.id
          }).values[ 0 ].current.value
        }

        if (mainEntry && !isBlankNodeUri(mainEntry)) {
          // Search in work index with mainEntry constraint in structured query
          searchBody = esquery.worksByMainEntry(searchString, mainEntry)
        } else {
          // Search in publication/work index, using structured query tailored for specific type
          searchBody = esquery.basic(indexType, searchString)
        }
      }

      axiosMethod(searchURI, searchBody)
        .then(function (response) {
          var results = ensureJSON(response.data)
          results.hits.hits.forEach(function (hit) {
            var item = hit._source
            item.isChecked = false
            item.score = hit._score
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
          let items = _.map(_.pluck(results.hits.hits, '_source'),
            Main.searchResultItemHandlers[ config.search[ indexType ].itemHandler || 'defaultItemHandler' ])
          var highestScoreIndex
          _.each(items, function (item, index) {
            if (item.score === results.hits.max_score) {
              highestScoreIndex = index
            }
          })
          var exactMatchWasFound = false
          if (items.length > 0 && highestScoreIndex !== undefined && fieldForSortedListQuery && searchString.toLocaleLowerCase() === _.flatten([ items[ highestScoreIndex ][ fieldForSortedListQuery ] ]).join().toLocaleLowerCase()) {
            items[ highestScoreIndex ].exactMatch = true
            exactMatchWasFound = true
          }
          ractive.set(event.keypath + '.searchResult', {
            items: items,
            origin: event.keypath,
            searchTerm: searchString,
            highestScoreIndex: exactMatchWasFound ? highestScoreIndex : config.search[ indexType ].scrollToMiddleOfResultSet ? items.length / 2 - 1 : 0
          })
          positionSupportPanels()
        })
      //    .catch(function (err) {
      //    console.log(err)
      // })
    }

    let debouncedSearch = _.debounce(doSearch, 500)

    function updateInputsForDependentResources (targetType, resourceUri) {
      forAllGroupInputs(function (input) {
        if (input.dependentResourceTypes && _.contains(input.dependentResourceTypes, targetType)) {
          input.values[ 0 ] = input.values[ 0 ] || {}
          input.values[ 0 ].current.value = resourceUri
        }
      })
    }

    function executePatch (subject, patches, keypath, errors) {
      let waiter = ractive.get('waitHandler').thisMayTakeSomTime()
      ractive.set('save_status', 'arbeider...')
      // strip empty blank nodes
      let emptyBlankNodeIndexes = []
      _.each(patches, function (patch, index) {
        if (patch.o.type === 'http://www.w3.org/2001/XMLSchema#anyURI' && isBlankNodeUri(patch.o.value)) {
          if (!_.some(patches, function (subjectPatch) {
              return subjectPatch.s === patch.o.value
            })) {
            emptyBlankNodeIndexes.unshift(index)
          }
        }
      })
      _.each(emptyBlankNodeIndexes, function (index) {
        patches.splice(index, 1)
      })
      axios.patch(proxyToServices(subject), JSON.stringify(patches, undefined, 2), {
        headers: {
          Accept: 'application/ld+json',
          'Content-Type': 'application/ldpatch+json'
        }
      })
        .then(function (response) {
          // successfully patched resource
          updateInputsForResource(response, subject, {
            keepDocumentUrl: true, inputs: [ _.find(allInputs(), function (input) {
              return input.predicate.indexOf('recordId') !== -1
            }) ]
          })

          // keep the value in current.old - so we can do create delete triple patches later
          if (keypath) {
            var cur = ractive.get(keypath + '.current')
            if (cur) {
              ractive.set(keypath + '.old.value', cur.value || '')
              ractive.set(keypath + '.old.lang', cur.lang)
            }
          }
          ractive.set('save_status', 'alle endringer er lagret')
          ractive.update().then(function () {
            if (waiter) {
              waiter.done()
            }
          })
        })
        .catch(function (response) {
          // failed to patch resource
          console.log('HTTP PATCH failed with: ')
          errors.push('Noe gikk galt! Fikk ikke lagret endringene')
          ractive.set('save_status', '')
          if (waiter) {
            waiter.done()
          }
        })
    }

    function setTaskDescription (taskDescriptionKey) {
      let taskDescription = ractive.get(`applicationData.config.taskDescriptions.${taskDescriptionKey}`)
      if (taskDescription) {
        ractive.set('currentTaskDescription', taskDescription)
      }
    }

    let closePreview = function () {
      $('#iframecontainer').hide().find('iframe').hide().attr('src', null)
      $('#iframecontainer iframe').hide()
      $('#rdf-content').hide().html(null)
      $('#block').fadeOut()
    }

    function showOverlay (uri) {
      $('#block').click(closePreview).fadeIn()
      $('#close-preview-button').click(closePreview)
      $('#iframecontainer').fadeIn().find('iframe').attr('src', uri).load(function () {
        $('#loader').fadeOut(function () {
          $('iframe').fadeIn()
        })
      })
    }

    function showTurtle (uri) {
      const openTabTargets = {
        publication: 1,
        work: 2
      }
      $('#block').click(closePreview).fadeIn()
      $('#close-preview-button').click(closePreview)
      $('#iframecontainer iframe').hide()
      $('#iframecontainer').fadeIn(function () {
        $.ajax({
          type: 'get',
          url: uri,
          success: function (response) {
            $('#rdf-content').html(response
              .replace(/[<>]/g, function (match) {
                return match === '<' ? '&lt;' : '&gt;'
              })
              .replace(/&lt;http:\/\/data\.deichman\.no\/(work|publication)\/(w|p)([a-f0-9]+)&gt;/g, function (all, type, shortType, resourceId) {
                return `&lt;<a target="_blank" href="/cataloguing/?template=workflow&${type.charAt(0).toUpperCase()}${type.slice(1)}=http%3A%2F%2Fdata.deichman.no%2F${type}%2F${shortType}${resourceId}&openTab=${openTabTargets[ type ]}">http://data.deichman.no/${type}/${shortType}${resourceId}</a>&gt;`
              }))
            $('#loader').fadeOut(function () {
              $('#rdf-content').fadeIn()
            })
          }
        })
      })
    }

    function closeCompare (type) {
      ractive.set('compare', null)
      ractive.set('duplicateSearchTerm', undefined)
      _.each(ractive.get(`applicationData.flattenedInputsForDomainType.${type}`), function (input) {
        delete input.compareValues
        _.each(input.subInputs, function (subInput) {
          delete subInput.input.compareValues
        })
      })
      ractive.update()
      // ractive.set(`applicationData.inputsForDomainType.${type}.*.subInputs.*.input.compareValues`, [ { nonEditable: true } ])
      // ractive.set(`applicationData.inputsForDomainType.${type}.*.compareValues`, [ { nonEditable: true } ])
      setTaskDescription(`edit${type}`)
      updateBrowserLocationWithQueryParameter(`compare_with_${type}`, undefined)
      // hack to make things not look uncool
      $('.inner-content').addClass('dummy_' + _.uniqueId())
      positionSupportPanels()
    }

    function inputHasAcceptedSuggestions (targetInput, inputIndex) {
      return (!targetInput.isSubInput || ((targetInput.parentInput.hasAcceptedSuggestions || [])[ inputIndex ]))
    }

    function inputCanReceiveAdditionalSuggestions (targetInput) {
      return targetInput.widgetOptions && targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom
    }

    var Main = {
      searchResultItemHandlers: {
        defaultItemHandler: function (item) {
          return item
        },
        personItemHandler: function (personItem) {
          _.each(personItem.work, function (work) {
            work.role = _.flatten([ work.role || [] ])
          })
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
            publicationItem.recordIdPrefixed = `tittelnr ${publicationItem.recordId}`
          }
          return publicationItem
        }
      },
      patchResourceFromValue: function (subject, predicate, oldAndcurrentValue, datatype, errors, keypath) {
        var patches = Ontology.createPatch(subject, predicate, oldAndcurrentValue, typesFromRange(datatype).rdfType)
        if (patches.length > 0) {
          executePatch(subject, patches, keypath, errors)
        }
      },
      predefinedLabelValue: function (type, uri) {
        return i18nLabelValue(_.find(ractive.get('predefinedValues.' + type), function (predefinedValue) {
          return predefinedValue[ '@id' ] === uri
        })[ 'label' ])
      },

      restart: function () {
        var url = URI.parse(document.location.href)
        url.query = {}
        window.location.replace(URI.build(url))
      },
      init: function (options) {
        options = options || {}
        let query = URI.parseQuery(URI.parse(document.location.href).query)
        let template = '/templates/' + (options.template || query.template || 'menu') + '.html'
        var partials = [
          'input',
          'input-string',
          'input-boolean',
          'input-string-large',
          'input-lang-string',
          'input-gYear',
          'input-duration',
          'input-date-time',
          'input-nonNegativeInteger',
          'searchable-with-result-in-side-panel',
          'support-for-searchable-with-result-in-side-panel',
          'support-for-input-string',
          'support-for-edit-authority',
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
          'inverse-one-to-many-relationship',
          'work',
          'relations',
          'publication',
          'delete-publication-dialog',
          'delete-work-dialog',
          'delete-resource-dialog',
          'confirm-enable-special-input-dialog',
          'alert-existing-resource-dialog',
          'additional-suggestions-dialog',
          'merge-resources-dialog',
          'edit-resource-warning-dialog',
          'accordion-header-for-collection',
          'readonly-input',
          'readonly-input-string',
          'readonly-input-boolean',
          'readonly-input-string-large',
          'readonly-input-gYear',
          'readonly-input-duration',
          'readonly-input-date-time',
          'readonly-input-nonNegativeInteger',
          'readonly-select-predefined-value',
          'readonly-hidden-url-query-value',
          'readonly-searchable-with-result-in-side-panel'
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

        function saveObject (event, applicationData, index, op) {
          let waitHandler = ractive.get('waitHandler')
          waitHandler.newWaitable(event.original.target)
          let waiter = waitHandler.thisMayTakeSomTime()
          const input = event.input || ractive.get(parentOf(grandParentOf(grandParentOf(event.keypath))))
          const bulkEntryInputChain = _.chain(ractive.get('inputGroups.4.inputs.0.subInputs'))
            .pluck('input')
            .filter(function (input) { return input.widgetOptions && input.widgetOptions.enableBulkEntry })
          const bulkEntryData = bulkEntryInputChain
            .pluck('values')
            .pluck(index)
            .filter(function (value) { return value && value.multiline })
            .pluck('current')
            .pluck('value')
            .map(function (value) { return value.split('\n') })
            .flatten()
            .compact()
            .value()
          const bulkEntryPredicate = bulkEntryInputChain
            .pluck('predicate').first().value()

          const autoNumberInput = inputFromInputId(bulkEntryInputChain.first().value().widgetOptions.enableBulkEntry.autoNumberInputRef)
          let nextAutoNumber = autoNumberInput ? autoNumberInput.nextNumber : undefined
          var options = bulkEntryData && bulkEntryData.length > 0 ? {
            bulkMultiply: function (ops) {
              return _.chain(bulkEntryData).map(function (value) {
                  var opsClone = deepClone(ops)
                  _.each(opsClone, function (opSpec) {
                    opSpec.alternativeValueFor = {
                      [bulkEntryPredicate]: value
                    }
                    if (!Number(nextAutoNumber).isNaN) {
                      opSpec.alternativeValueFor[ autoNumberInput.predicate ] = nextAutoNumber++
                    }
                  })
                  return opsClone
                }
              ).flatten().value()
            }
          } : {}

          return patchObject(input, applicationData, index, op, options).then(function () {
            visitInputs(input, function (input) {
              if (input.isSubInput) {
                _.each(input.values, function (value, valueIndex) {
                  if (valueIndex === index) {
                    ractive.set(`${input.keypath}.values.${index}.nonEditable`, true)
                  }
                })
              }
            })
            input.allowAddNewButton = true
            var promises = []
            promises.push(ractive.update())
            if (event.context) {
              var subInputs = grandParentOf(event.keypath)
              _.each(event.context.subInputs, function (input, subInputIndex) {
                if (_.contains([ 'select-authorized-value', 'entity', 'searchable-authority-dropdown' ], input.input.type)) {
                  var valuesKeypath = subInputs + '.' + subInputIndex + '.input.values.' + index + '.current.value.0'
                  promises = promises.concat(loadLabelsForAuthorizedValues([ ractive.get(valuesKeypath) ], input.input, index))
                }
              })
            }
            promises.push(new Promise(waiter.done))
            sequentialPromiseResolver(promises)
          })
        }

        function patchObject (input, applicationData, index, op, options) {
          options = _.defaults(options || {}, {
            bulkMultiply: function (ops) {
              return ops
            }
          })
          const opSpec = {
            add: [ {
              operation: 'add',
              useValue: 'current'
            } ],
            del: [ {
              operation: 'del',
              useValue: 'current'
            } ],
            replace: [
              {
                operation: 'del',
                useValue: 'old'
              },
              {
                operation: 'add',
                useValue: 'current'
              } ]
          }
          var patch = []
          var actualSubjectType = _.first(input.subInputs).input.values[ index ].subjectType || input.subjectType || input.rdfType
          var deleteSubjectType = _.first(input.subInputs).input.values[ index ].oldSubjectType || actualSubjectType
          var mainSubject = ractive.get('targetUri.' + actualSubjectType)
          var deleteSubject = ractive.get('targetUri.' + deleteSubjectType)
          const opSpecs = options.bulkMultiply(opSpec[ op ])
          _.each(opSpecs, function (spec, opIndex) {
            patch.push({
              op: spec.operation,
              s: spec.operation === 'del' ? deleteSubject : mainSubject,
              p: input.predicate,
              o: {
                value: `_:b${opIndex}`,
                type: 'http://www.w3.org/2001/XMLSchema#anyURI'
              }
            })
            if (input.range) {
              patch.push({
                op: spec.operation,
                s: `_:b${opIndex}`,
                p: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                o: {
                  value: applicationData.ontology[ '@context' ][ 'deichman' ] + input.range,
                  type: 'http://www.w3.org/2001/XMLSchema#anyURI'
                }
              })
            }
            _.each(input.subInputs, function (subInput) {
              if (!(subInput.input.visible === false)) {
                var value = spec.alternativeValueFor && spec.alternativeValueFor[ subInput.input.predicate ]
                  ? spec.alternativeValueFor[ subInput.input.predicate ]
                  : subInput.input.values[ index ] ? subInput.input.values[ index ][ spec.useValue ].value : undefined
                if (typeof value !== 'undefined' && value !== null && (typeof value !== 'string' || value !== '') && (!_.isArray(value) || (value.length > 0 && value[ 0 ] !== ''))) {
                  patch.push({
                    op: spec.operation,
                    s: `_:b${opIndex}`,
                    p: subInput.input.predicate,
                    o: {
                      value: (_.isArray(value) ? `${value[ 0 ]}` : `${value}`).trim(),
                      type: subInput.input.datatypes[ 0 ]
                    }
                  })
                }
              }
            })
            if (input.isMainEntry) {
              patch.push({
                op: spec.operation,
                s: `_:b${opIndex}`,
                p: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                o: {
                  value: applicationData.ontology[ '@context' ][ 'deichman' ] + 'MainEntry',
                  type: 'http://www.w3.org/2001/XMLSchema#anyURI'
                }
              })
            }
          })

          ractive.set('save_status', 'arbeider...')
          return axios.patch(proxyToServices(mainSubject), JSON.stringify(patch, undefined, 2), {
            headers: {
              Accept: 'application/ld+json',
              'Content-Type': 'application/ldpatch+json'
            }
          }).then(function (response) {
            let parsed = ldGraph.parse(response.data)
            _.each(applicationData.sortOrders, function (sortOrder) {
              let root = sortNodes(parsed.byId(mainSubject).outAll(sortOrder.predicate), sortOrder.objectSortOrder)
              ractive.get('lastRoots')[ mainSubject ] = { [sortOrder.predicate]: root }
              ractive.update('lastRoots')
            })
            let addedMultivalues = _.select(opSpecs, function (spec) { return spec.operation === 'add' }).length
            if (op === 'del' || addedMultivalues > 1) {
              removeInputsForObject(input, index)()
              ractive.update()
              if (addedMultivalues > 1) {
                updateInputsForResource(response, mainSubject, { inputs: _.pluck(input.subInputs, 'input') })
              }
            }
            return response
          })
            .then(function (response) {
              // do an extra patch to invalidate cache of old subject
              if (mainSubject !== deleteSubject) {
                axios.patch(proxyToServices(deleteSubject), JSON.stringify([], undefined, 2), {
                  headers: {
                    Accept: 'application/ld+json',
                    'Content-Type': 'application/ldpatch+json'
                  }
                })
              }
              return response
            })
            .then(function (response) {
              // successfully patched resource
              ractive.set('save_status', 'alle endringer er lagret')
              return response
            })
          // .catch(function (response) {
          //    // failed to patch resource
          //    console.log('HTTP PATCH failed with: ')
          //    errors.push('Noe gikk galt! Fikk ikke lagret endringene')
          //    ractive.set('save_status', '')
          // })
        }

        let templateSelection = function (selection) {
          var source = $(selection.element.parentElement).attr('data-accepted-source')
          var sourceSpan = source ? `<span class='suggestion-source suggestion-source-${source}'/>` : ''
          return $(`<span>${selection.text}${sourceSpan}</span>`)
        }

        function inputLabelWithContext (input) {
          return input.isSubInput ? input.parentInput.label + ': ' + ractive.get(`${parentOf(input.keypath)}.label`) : input.label
        }

        function tabIndexForNode (node) {
          let nodeInfo = Ractive.getNodeInfo(node)
          let tabSelectedKeypath = `inputGroups.${nodeInfo.index.groupIndex}.tabSelected`
          ractive.observe(tabSelectedKeypath, function (newValue, oldvalue) {
            if (!$(node).is('select.select2-hidden-accessible')) {
              $(node).attr('tabindex', newValue ? '0' : '-1')
            }
            $(node).siblings().find('span ul li input').first().attr('tabindex', newValue ? '0' : '-1')
          }, { init: true })
        }

        function whileUnobserved (doStuff) {
          _.invoke(ractive.get('observers'), 'cancel')
          doStuff()
          enableObservers()
        }

        var initRactive = function (applicationData) {
          // decorators
          var select2 = function (node, mode) {
            tabIndexForNode(node)
            if (mode.mode === 'singleSelect') {
              $(node).select2({
                maximumSelectionLength: 1,
                templateSelection: templateSelection
              })
            } else if (mode.mode === 'multiSelect') {
              $(node).select2({
                templateSelection: templateSelection
              })
            } else if (mode.mode === 'authoritySelectSingle') {
              var inputDef = ractive.get(grandParentOf(Ractive.getNodeInfo(node).keypath))
              if (_.isArray(inputDef.indexTypes) && inputDef.indexTypes.length > 1) {
                throw new Error('searchable-authority-dropdown supports only supports singe indexType')
              }
              var indexType = _.isArray(inputDef.indexTypes) ? inputDef.indexTypes[ 0 ] : inputDef.indexTypes
              var config = ractive.get('config')
              $(node).select2({
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

                    var select2Data = _.map(data.hits.hits, function (obj) {
                      obj.id = obj._source.uri
                      obj.text = _.compact(_.map(inputDef.indexDocumentFields, function (field) {
                        return obj._source[ field ]
                      })).join(' - ')
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
              })
            } else {
              throw Error("Value for as-select2 must be 'singleSelect', 'multiselect' or 'authoritySelectSingle")
            }

            var enableChange = false
            $(node).on('select2:selecting select2:unselecting', function (event) {
              enableChange = true
            })
            var setting = false
            $(node).on('change', function (e) {
              if (enableChange && !setting) {
                setting = true
                enableChange = false
                var inputValue = Ractive.getNodeInfo(e.target)
                var keypath = inputValue.keypath
                ractive.set(keypath + '.current.value', $(e.target).val() || [])
                var inputNode = ractive.get(grandParentOf(keypath))
                let target = ractive.get('targetUri.' + unPrefix(inputNode.domain))
                if (target && !inputNode.isSubInput && (keypath.indexOf('enableCreateNewResource') === -1 || keypath.indexOf('enableEditResource') !== -1)) {
                  Main.patchResourceFromValue(target, inputNode.predicate,
                    ractive.get(keypath), inputNode.datatypes[ 0 ], errors, keypath)
                }
                setting = false
              }
            })

            let keypath = this.getNodeInfo(node).resolve() + '.current.value'
            var observer = ractive.observe(keypath, function (newvalue, oldValue) {
              if (!setting && (newvalue || [])[ 0 ] !== (oldValue || [])[ 0 ]) {
                setting = true
                window.setTimeout(function () {
                  $(node).val(newvalue).trigger('change')
                  setting = false
                }, 0)
              }
            })

            return {
              teardown: function () {
                $(node).select2('destroy')
                observer.cancel()
              }
            }
          }

          var accordion = function (node) {
            $(node).accordion({
              collapsible: true,
              header: '> .accordion-header'
            })
            return {
              teardown: function () {}
            }
          }
          const repositionSupportPanel = function (node) {
            Main.repositionSupportPanelsHorizontally()
            positionSupportPanels()
            return {
              teardown: function () {}
            }
          }
          const pasteSanitizer = function (node) {
            $(node)
              .keypress(function (e) {
                return e.which !== 13
              })
              .on('paste', function (e) {
                e.originalEvent.preventDefault()
                if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
                  var text = e.originalEvent.clipboardData.getData('text/plain').replace(/\r?\n|\r/g, '').trim()
                  document.execCommand('insertHTML', false, text)
                }
              })
            return {
              teardown: function () {}
            }
          }

          const handleAddNewBySelect2 = function (node) {
            const inputKeyPath = grandParentOf(Ractive.getNodeInfo(node).keypath)
            ractive.set(inputKeyPath + '.allowAddNewButton', false)
            ractive.set(inputKeyPath + '.addNewHandledBySelect2', true)
            return {
              teardown: function () {}
            }
          }
          const clickOutsideSupportPanelDetector = function (node) {
            const rightDummyPanel = $('#right-dummy-panel')
            $(document).click(function (event) {
              if (!event.isDefaultPrevented()) {
                const supportPanelLeftEdge = rightDummyPanel.offset().left
                const supportPanelWidth = rightDummyPanel.width()
                const outsideX = event.originalEvent.pageX < supportPanelLeftEdge || event.originalEvent.pageX > (supportPanelLeftEdge + supportPanelWidth)
                const targetIsInsideSupportPanel = !outsideX && $(event.originalEvent.target).closest('span.support-panel').length
                const targetIsSupportPanel = !outsideX && $(event.originalEvent.target).is('span.support-panel')
                const targetIsASupportPanelButton = !outsideX && $(event.originalEvent.target).is('.support-panel-button')

                const targetIsARadioButtonThatWasOffButIsOnNow = !outsideX && $(event.originalEvent.target).is('input[type=\'radio\'][value=\'on\']')
                const targetIsEditResourceLink = !outsideX && $(event.originalEvent.target).is('a.edit-resource')
                const targetIsASelect2RemoveSelectionCross = !outsideX && $(event.originalEvent.target).is('span.select2-selection__choice__remove') && !$(event.originalEvent.target).is('.overrride-outside-detect')
                if (!(targetIsInsideSupportPanel || targetIsARadioButtonThatWasOffButIsOnNow || targetIsSupportPanel || targetIsASupportPanelButton || targetIsASelect2RemoveSelectionCross || targetIsEditResourceLink)) {
                  clearSupportPanels({ keep: [ 'enableCreateNewResource' ] })
                }
              }
            })
            return {
              teardown: function () {}
            }
          }
          const unload = function (node) {
            window.onbeforeunload = saveSuggestionData
            return {
              teardown: function () {}
            }
          }
          const timePicker = function (node) {
            require('timepicker')
            $(node).timepicker({ 'timeFormat': 'H:i:s', step: 50000, 'wrapHours': false })
            return {
              teardown: function () {}
            }
          }
          const slideDown = function (node) {
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

          const searchable = function (node) {
            let keypath = Ractive.getNodeInfo(node).keypath
            const value = ractive.get(keypath)
            if (value && !value.searchable) {
              ractive.set(`${keypath}.searchable`, true)
              ractive.set(`${keypath}.uniqueId`, _.uniqueId())
            }
            return {
              teardown: function () {}
            }
          }
          const tabIndex = function (node, tabSelected) {
            let focusable = tabSelected
            if (typeof focusable === 'undefined') {
              tabIndexForNode(node)
            } else {
              $(node).attr('tabindex', focusable ? 0 : -1)
            }

            return {
              teardown: function () {}
            }
          }
          const disabled = function (node) {
            $(node).find('input,select').prop('disabled', true)
            return {
              teardown: function () {}
            }
          }
          const formatter = function (node, formatter) {
            if (formatter === 'isbn') {
              $(node).on('input', function () {
                let value = $(node).val().replace(/[^\dXx]*/g, '') // ISBN.parse not 100% with hyphens
                let parsedIsbn = ISBN.parse(value)
                if (parsedIsbn) {
                  if (parsedIsbn.isIsbn10()) {
                    $(node).val(parsedIsbn.asIsbn10(true))
                  } else {
                    if (parsedIsbn.isIsbn13()) {
                      $(node).val(parsedIsbn.asIsbn13(true))
                    }
                  }
                  ractive.updateModel()
                }
              })
            }
            return {
              teardown: function () {}
            }
          }
          const relations = function (node, uri) {
            const keypath = Ractive.getNodeInfo(node).keypath
            ractive.set(`${keypath}.relations`, null)
            let type = _.last(parentOf(grandParentOf(keypath)).split('.'))
            uri = uri || ractive.get(`targetUri.${type}`)
            axios.get(proxyToServices(`${uri}/relations`)).then(function (response) {
              ractive.set(`${keypath}.relations`, response.data)
            })
            return {
              teardown: function () {}
            }
          }
          const repositionSupportPanels = function (node) {
            Main.repositionSupportPanelsHorizontally()
            return {
              teardown: function () {}
            }
          }
          const rangeSlider = function (node, args) {
            const stats = args.rangeStats
            const input = args.input
            const $node = $(node)
            const handle = $node.find('.range-slider-handle')
            $node.slider({
              value: stats.start,
              min: 1,
              max: stats.numberOfObjects,
              step: stats.rangeLength,
              create: function () {
                const sliderPos = $(this).slider('value')
                handle.text(`${sliderPos}/${stats.numberOfObjects}`)
              },
              slide: function (event, ui) {
                handle.text(`${ui.value}/${stats.numberOfObjects}`)
              },
              change: function (event, ui) {
                handle.text(`${ui.value}/${stats.numberOfObjects}`)
              },
              stop: function (event, ui) {
                handleRangeShift({
                  original: {
                    target: $node.prev('.save-placeholder').prev()
                  },
                  context: { input:args.input }
                }, 'customRange', ui.value - 1, stats.rangeLength)
              }
            })
            const observer = ractive.observe(`${input.keypath}.subInputs.0.input.rangeStats`, function (stats, oldVal, keypath) {
              $node.slider('option', {
                value: stats.start,
                max: stats.numberOfObjects
              })
            }, { init: false })

            return {
              teardown: function () {
                observer.cancel()
              }
            }
          }
          const heightAligned = function (node) {
            const panelParts = $(node).closest('.height-aligned').find('.panel-part')
            if (panelParts.length === 4) {
              const leftPanelPart = panelParts.get(1)
              const leftBottom = leftPanelPart.getBoundingClientRect().bottom
              const rightPanelPart = panelParts.get(3)
              const rightBottom = rightPanelPart.getBoundingClientRect().bottom
              const diff = rightBottom - leftBottom
              const leftField = $(leftPanelPart).find('.field, .pure-u-1-1').last().css('margin-bottom', null)
              const rightField = $(rightPanelPart).find('.field, .pure-u-1-1').last().css('margin-bottom', null)
              if (diff > 0) {
                leftField.css('margin-bottom', diff + Number((leftField.css('margin-bottom') || "0").replace("px", "")))
              }
              if (diff < 0) {
                rightField.css('margin-bottom', -diff + Number((rightField.css('margin-bottom') || "0").replace("px", "")))
              }
            }
            return {
              teardown: function () {}
            }
          }
          const authorityEdit = function (node, args) {
            if (args.inputsKeypath) {
              ractive.set('tabSelected', true)
              _.invoke(ractive.get('observers'), 'cancel')
              enableObservers(applicationData, args.inputsKeypath)
              if (args.subjectType) {
                _.each(ractive.get(args.inputsKeypath), function (input) {
                  input.subjectTypes = [ args.subjectType ]
                  _.chain(input.subInputs).pluck('input').each(function (input) {
                    if (input.values[ 0 ]) {
                      input.values[ 0 ].subjectType = args.subjectType
                    }
                  })
                })
              }
            }
            return {
              teardown: function () {}
            }
          }
          const draggable = function (node, args) {
            setTimeout(function () {
              // check for duplicates
              if (args.input && args.input.subInputs) {
                let valueHashes = []
                const numberOfValues = _.chain(args.input.subInputs).pluck('input').pluck('values').value().length
                for (let i = 0; i < numberOfValues; i++) {
                  valueHashes.push(_.chain(args.input.subInputs).pluck('input').pluck('values').pluck(i).pluck('current').pluck('value').value().reduce(function (memo, val) {return `${memo}|${val}`}))
                }
                let compareValueHash = _.chain(args.input.subInputs).pluck('input').pluck('compareValues').pluck(args.inputValueIndex).pluck('current').pluck('value').value().reduce(function (memo, val) {return `${memo}|${val}`})
                if (valueHashes.includes(compareValueHash)) {
                  return
                }
              } else {
                if (_.chain(args.values).pluck('current').pluck('value').value().includes(args.compareValue.current.value)) {
                  return
                }
              }
              const draggedClass = `draggable_${args.inputIndex}`
              // source
              $(node).addClass(draggedClass)
              $(node).draggable({
                helper: 'clone',
                appendTo: 'parent'
              }).data({
                value: _.chain(deepClone(args.value)).omit('old').defaults({ old: { value: undefined } }).value(),
                input: args.input,
                valueIndex: args.inputValueIndex
              });
            })
            return {
              teardown: function () {}
            }
          }
          const dropZone = function (node, args) {
            const draggedClass = `draggable_${args.inputIndex}`
            //target
            $(node).droppable({
              activeClass: 'drop-target',
              accept: `.${draggedClass}`,
              drop: function (event, ui) {
                if (args.input.subInputs) {
                  const data = $(ui.draggable).data()
                  var newValueIndex
                  _.chain(args.input.subInputs).pluck('input').each(function (input, inputIndex) {
                    const lastValue = _.last(input.values).current.value
                    if ([ '', undefined, null ].includes(lastValue) || Array.isArray(lastValue) && !lastValue.length) {
                      input.values.splice(-1, 1, data.input.subInputs[ inputIndex ].input.compareValues[ data.valueIndex ])
                    } else {
                      input.values.push(data.input.subInputs[ inputIndex ].input.compareValues[ data.valueIndex ])
                    }
                    newValueIndex = input.values.length - 1
                  })
                  ractive.update()
                  ractive.fire('saveNewObject', {
                    input: args.input,
                    original: {
                      target: node
                    }
                  }, newValueIndex)
                } else {
                  if ([ '', undefined, null ].includes(_.last(args.input.values).current.value)) {
                    args.input.values.splice(-1, 1, $(ui.draggable).data().value)
                  } else {
                    args.input.values.push($(ui.draggable).data().value)
                  }
                  ractive.update()
                  ractive.fire('patchResource',
                    { input: args.input, context: $(ui.draggable).data().value, original: { target: node } },
                    args.input.predicate, unPrefix(args.input.domain))
                }
                heightAligned(node.parentNode)
                setTimeout(function () {
                  $(ui.draggable).draggable('destroy')
                })
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

          const valueOfInputById = function (inputId, valueIndex) {
            var keyPath = ractive.get(`inputLinks.${inputId}`)
            return ractive.get(`${keyPath}.values.${valueIndex}.current.value`)
          }

          const displayValueOfInputById = function (inputId, valueIndex) {
            var keyPath = ractive.get(`inputLinks.${inputId}`)
            return ractive.get(`${keyPath}.values.${valueIndex}.current.displayValue`)
          }

          // Initialize ractive component from template
          ractive = new Ractive({
            el: 'container',
            lang: 'no',
            template: applicationData.template,
            events: {
              backspace: function (node, fire) {
                function keydownHandler (event) {
                  var which = event.which || event.keyCode

                  if (which !== 9) {
                    event.preventDefault()
                  }
                  if (which === 8) {
                    fire({
                      node,
                      original: event
                    })
                  }
                }

                node.addEventListener('keydown', keydownHandler, false)

                return {
                  teardown () {
                    node.removeEventListener('keydown', keydownHandler, false)
                  }
                }
              }
            },
            computed: {
              firstAndLastVisibleInputs: function () {
                let result = []

                const handleInput = function (input, groupIndex, inputIndex, subInputIndex) {
                  result[ groupIndex ] = result[ groupIndex ] || { first: 100, last: 0 }
                  let showIt = (input.visible && checkShouldInclude(input) && !(typeof ractive.get('targetUri.' + input.showOnlyWhenEmpty) !== 'undefined'))
                  if (showIt && inputIndex < result[ groupIndex ].first) {
                    result[ groupIndex ].first = inputIndex
                  }
                  if (showIt && inputIndex > result[ groupIndex ].last) {
                    result[ groupIndex ].last = inputIndex
                  }
                  return false
                }

                _.each(_.values(ractive.get('applicationData.inputsForDomainType')), function (inputs, groupIndex) {
                  _.each(inputs, function (input, inputIndex) {
                    handleInput(input, groupIndex + 100, inputIndex)
                    ractive.set(`applicationData.domainInputGroupIndex.${unPrefix(input.domain)}`, groupIndex + 100)
                  })
                })
                forAllGroupInputs(handleInput, { handleInputGroups: true })
                return result
              }
            },
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
              compare: false,
              compareValues: {},
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
              formatDateTime: function (dateTime) {
                if (dateTime) {
                  let date = new Date(dateTime)
                  if (!isNaN(date.getTime())) {
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                  } else {
                    return dateTime
                  }
                }
              },
              format: function (context, templateKey) {
                const compiled = _.template(context[ templateKey ])
                try {
                  return compiled(context)
                } catch (e) {
                  // nop
                }
              },
              predefinedLabelValue: Main.predefinedLabelValue,
              publicationId: function () {
                var publicationIdInput = _.find(ractive.get('inputs'), function (input) {
                  return input.predicate.indexOf('#recordId') !== -1
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
              getExplanation: function (explanations, value) {
                return _.find(explanations.patterns, function (pattern) {
                  return RegExp(pattern.match).test(value)
                }).explanation
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
                let searchResultItems = getDisplayProperties(itemLabelProperties, function (prop) {
                  return item[ prop ]
                })
                return _.compact(_.pluck(searchResultItems, 'val'))
                  .join(' ')
                  .replace('– ', '–')
                  .replace(/[,:]$/, '')
                  .replace(': ', ' : ')
              },
              getLinkfromUri: function (item, linkProps) {
                return item.uri.replace(new RegExp(linkProps.regExp), linkProps.replacement)
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
              isAdvancedQuery: esquery.isAdvancedQuery,
              advancedSearchCharacters: advancedSearchCharacters,
              valueOfInputById: valueOfInputById,
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
                  let index = _.findIndex(_.sortBy(_.filter(values, function (value) {
                    return value.current.value !== null && value.current.value !== '' && value.current.value !== undefined
                  }), function (val) { return val.current.value }), function (v) {
                    return v.current.value === value
                  })
                  if (index > -1) {
                    return Number(index + 1).toString()
                  } else {
                    return valueIndex + 1
                  }
                } else {
                  return valueIndex + 1
                }
              },
              oneOrMoreEnabled: function (items) {
                return _.some(items, function (item) { return item.enable })
              },
              checkShouldInclude: checkShouldInclude,
              abbreviate: function (label) {
                return applicationData.config.abbreviations[ label ] || label
              },
              hasNextOrPrevRange: function (input) {
                return _.some(input.subInputs, function (subInput) {
                  return ractive.get(`${subInput.input.keypath}.nextRange`) || ractive.get(`${subInput.input.keypath}.prevRange`)
                })
              },
              hasPrevRange: function (input) {
                return _.some(input.subInputs, function (subInput) {
                  return ractive.get(`${subInput.input.keypath}.prevRange`)
                })
              },
              hasNextRange: function (input) {
                return _.some(input.subInputs, function (subInput) {
                  return ractive.get(`${subInput.input.keypath}.nextRange`)
                })
              }
            },
            decorators: {
              repositionSupportPanel,
              select2,
              handleAddNewBySelect2,
              clickOutsideSupportPanelDetector,
              unload,
              accordion,
              timePicker,
              slideDown,
              pasteSanitizer,
              formatter,
              searchable,
              tabIndex,
              disabled,
              relations,
              repositionSupportPanels,
              rangeSlider,
              heightAligned,
              authorityEdit,
              draggable,
              dropZone
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
                $(transition.element.node).slideUp()
              }
            }
          })
          function loadInverseRelated (event, parentUri) {
            return axios.get(proxyToServices(`${parentUri}/inverseRelationsBy/${event.context.inverseRdfProperty}?projection=${_.pluck(event.context.showFieldsOfRelated, 'field').join('&projection=')}`))
              .then(function (response) {
                ractive.set(`${event.keypath}.relations`, response.data)
              })
          }

          function handleRangeShift (event, direction, start, rangeLength) {
            ractive.get('waitHandler').newWaitable(event.original.target)
            let waiter = ractive.get('waitHandler').thisMayTakeSomTime()
            setTimeout(function () {
              whileUnobserved(function () {
                  if (start !== undefined) {
                    _.each(_.chain(event.context.input.subInputs).pluck('input').invoke(direction, start, rangeLength).value(), function (f) {
                      f()
                    })
                  } else {
                    _.chain(event.context.input.subInputs).pluck('input').invoke(direction, start, rangeLength)
                  }
                }
              )
            })
            setTimeout(waiter.done)
          }

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
                var mainInput = (event.context || {}).input || ractive.get(event.keypath)
                let promises = []
                ractive.set(`${mainInput.keypath}.unFinished`, true)
                visitInputs(mainInput, function (input, index) {
                  let values = emptyValues(input.type === 'select-predefined-value', input.type === 'searchable-with-result-in-side-panel')[ 0 ]
                  if (index === 0) {
                    values.subjectType = _.isArray(mainInput.subjectTypes) && mainInput.subjectTypes.length === 1
                      ? mainInput.subjectTypes[ 0 ]
                      : null
                    values.oldSubjectType = values.subjectType
                  }
                  try {
                    promises.push(ractive.push(`${input.keypath}.values`, values))
                  } catch (e) {
                    // nop
                  }
                })
                sequentialPromiseResolver(promises)
                ractive.set(event.keypath + '.allowAddNewButton', false)
                ractive.set(`${mainInput.keypath}.unFinished`, false)
                positionSupportPanels()
                copyAdditionalSuggestionsForGroup(Number(event.keypath.split('.')[ 1 ]))
                ractive.update().then(function () {
                  heightAligned(document.main.$(event.node).closest('.height-aligned'))
                })
              },
              // patchResource creates a patch request based on previous and current value of
              // input field, and sends this to the backend.
              patchResource: function (event, predicate, rdfType, editAuthorityMode) {
                const inputValue = event.context
                const input = event.input || ractive.get(grandParentOf(event.keypath))
                const proceed = function () {
                  const subject = ractive.get('targetUri.' + rdfType)
                  if (subject) {
                    let waiter = ractive.get('waitHandler').newWaitable(event.original.target)
                    Main.patchResourceFromValue(subject, predicate, inputValue, input.datatypes[ 0 ], errors, event.keypath)
                    event.context.domain = rdfType
                    input.allowAddNewButton = true
                    waiter.cancel()
                  }
                  ractive.update()
                }
                const revert = function () {
                  ractive.set(`${event.keypath}.current.value`, event.context.old.value)
                }

                if (!input.isSubInput && (!event.keypath || event.keypath.indexOf('enableCreateNewResource') === -1)) {
                  if (inputValue.error || (inputValue.current.value === '' && inputValue.old.value === '') || inputValue.current.value === inputValue.old.value) {
                    return
                  }
                  if (editAuthorityMode && /^.*(name|prefLabel|mainTitle)$/.test(predicate)) {
                    warnEditResourceName({
                      fieldLabel: ractive.get(grandParentOf(event.keypath)).label.toLowerCase(),
                      rdfType,
                      proceed,
                      revert
                    })
                  } else {
                    proceed()
                  }
                }
              },
              saveNewObject: function (event, index) {
                if (!eventShouldBeIgnored(event)) {
                  const heightAlignedTarget = $(event.node).closest('.height-aligned')
                  saveObject(event, applicationData, index, 'add').then(function () {
                    heightAligned(heightAlignedTarget)
                  })
                }
              },
              replaceObject: function (event, index) {
                if (!eventShouldBeIgnored(event)) {
                  saveObject(event, applicationData, index, 'replace')
                  ractive.set(`${parentOf(grandParentOf(grandParentOf(event.keypath)))}.edit`, null)
                }
              },
              deleteObject: function (event, parentInput, index) {
                let waitHandler = ractive.get('waitHandler')
                waitHandler.newWaitable(event.original.target)
                let waiter = waitHandler.thisMayTakeSomTime()
                const heightAlignedTarget = $(event.node).closest('.height-aligned')
                patchObject(parentInput, applicationData, index, 'del')
                  .then(function () {
                    heightAligned(heightAlignedTarget)
                  })
                  .then(waiter.done)
              },
              editObject: function (event, parentInput, valueIndex) {
                _.each(parentInput.subInputs, function (input, inputIndex) {
                  ractive.set(`${parentInput.keypath}.subInputs.${inputIndex}.input.values.${valueIndex}.nonEditable`, false)
                })
                ractive.set(`${parentInput.keypath}.edit`, true)
                ractive.update()
              },
              searchResource: function (event, searchString, preferredIndexType, secondaryIndexType, loadWorksAsSubjectOfItem, options) {
                options = options || {}
                if (options.skipIfAdvancedQuery && esquery.isAdvancedQuery(searchString)) {
                  return
                }
                debouncedSearch(event, searchString, preferredIndexType, secondaryIndexType, loadWorksAsSubjectOfItem, options)
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
              editResource: function (event, editWith, uri, preAction) {
                if (preAction) {
                  preAction()
                }
                uri = uri || ractive.get(`targetUri.${event.context.rdfType}`)
                let initOptions = {
                  presetValues: {},
                  task: editWith.descriptionKey || `edit${event.context.rdfType}`,
                  template: editWith.template,
                  inputsKeypath: editWith.inputsKeypath
                }
                updateBrowserLocationClearAllExcept([ 'openTab' ])
                updateBrowserLocationWithUri(typeFromUri(uri), uri)
                forAllGroupInputs(function (input) {
                  if (input.type === 'hidden-url-query-value' &&
                    typeof input.values[ 0 ].current.value === 'string' &&
                    input.values[ 0 ].current.value !== '') {
                    let shortValue = input.values[ 0 ].current.value.replace(input.widgetOptions.prefix, '')
                    initOptions.presetValues[ input.widgetOptions.queryParameter ] = shortValue
                    updateBrowserLocationWithQueryParameter(input.widgetOptions.queryParameter, shortValue)
                  }
                })
                if (initOptions.task === 'maintPub') {
                  updateBrowserLocationWithTab(1)
                } else if (initOptions.task === 'maintWork') {
                  updateBrowserLocationWithTab(2)
                }
                Main.init(initOptions)
//                updateBrowserLocationWithTemplate(editWith.template)
              },
              focusNextItem: function (event) {
                let nextItemId = $(event.node).attr('data-next-sel-item')
                $(`#${nextItemId}`).focus()
              },
              focusPrevItem: function (event) {
                let prevItemId = $(event.node).attr('data-prev-sel-item')
                $(`#${prevItemId}`).focus()
              },
              focusNextSubItem: function (event) {
                let nextSubItemId = $(event.node).attr('data-next-sub-item')
                $(`#${nextSubItemId}`).focus()
              },
              focusPrevSubItem: function (event, itemIndex, subItemIndex) {
                if (subItemIndex > 0) {
                  let prevSubItemId = $(event.node).attr('data-prev-sub-item')
                  $(`#${prevSubItemId}`).focus()
                } else {
                  $(event.node).blur()
                  $(`#sel-item-${itemIndex}-details-toggle`).focus()
                }
              },
              focusDetailsToggle: function (event) {
                const itemId = $(event.node).attr('id')
                $(event.node).blur()
                $(`#${itemId}-details-toggle`).focus()
              },
              focusItem: function (event, itemId) {
                $(`#${itemId}`).focus()
              },
              handleTabForSearchResultItem: function (event, widgetOptions) {
                if (!event.original.shiftKey) {
                  $('#show-create-new-resource').focus()
                } else {
                  if ((widgetOptions || {}).maintenance) {
                    $($(event.node)
                      .closest('.maintenance-inputs')
                      .find('span[contenteditable = true]')[ event.index.inputIndex ])
                      .focus()
                  } else {
                    $(event.node)
                      .closest('.input')
                      .find('span[contenteditable = true]')
                      .focus()
                  }
                }
              },
              selectFirstVisibleSearchResultItem: function (event) {
                let searchResultBoxPosition = $('#search-result').position()
                let searchResultItem = _.find($('.search-result-item'), function (item) {
                  return $(item).position().top > searchResultBoxPosition.top
                })
                if (searchResultItem) {
                  searchResultItem.focus()
                }
              },
              selectSearchableItem: function (event, context, origin, displayValue, options) {
                ractive.set('currentSearchResultKeypath', grandParentOf(event.keypath))
                options = options || {}
                if (options.loadResourceForCompare) {
                  var queryArg = {}
                  const type = typeFromUri(context.uri)
                  queryArg[ `compare_with_${type}` ] = context.uri
                  loadOtherResource(queryArg)
                  setTaskDescription(`compare${type}`)
                  ractive.set(grandParentOf(event.keypath), undefined)
                  return
                }
                ractive.set(origin + '.searchResult', null)
                var inputKeyPath = grandParentOf(origin)
                var input = ractive.get(inputKeyPath)
                var uri = context.uri
                var editWithTemplateSpec = ractive.get(inputKeyPath + '.widgetOptions.editWithTemplate')
                if (editWithTemplateSpec) {
                  ractive.fire('editResource', null, editWithTemplateSpec, uri)
                } else if (ractive.get(inputKeyPath + '.widgetOptions.enableInPlaceEditing')) {
                  var indexType = ractive.get(inputKeyPath + '.indexTypes.0')
                  var rdfType = ractive.get(inputKeyPath + '.widgetOptions.enableEditResource.forms.' + indexType).rdfType
                  unloadResourceForDomain(rdfType)
                  fetchExistingResource(uri)
                  ractive.set(inputKeyPath + '.widgetOptions.enableEditResource.showInputs', Number.parseInt(_.last(origin.split('.'))))
                } else if (input.isMainEntry || options.subItem) {
                  fetchExistingResource(uri)
                    .then(function () {
                      updateInputsForDependentResources(typeFromUri(uri), uri)
                    })
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
                    let originTarget = $(`span[data-support-panel-base-id=support_panel_base_${ractive.get(origin).uniqueId}] span a.support-panel-expander`)
                    ractive.fire('patchResource',
                      { keypath: origin, context: ractive.get(origin), original: { target: originTarget } },
                      ractive.get(grandParentOf(origin)).predicate,
                      unPrefix(input.domain))
                  }
                  ractive.set(origin + '.searchResult', null)
                }
                event.original.preventDefault()
              },
              clearSupportPanels: function () {
                clearSupportPanels()
              },
              unselectEntity: function (event) {
                const closest = $(event.node).closest('span[data-support-panel-base-id^=support_panel_base_]')
                ractive.set(event.keypath + '.searchResult', null)
                ractive.set(event.keypath + '.current.value', '')
                ractive.set(event.keypath + '.current.displayValue', '')
                ractive.set(event.keypath + '.deletable', false)
                ractive.set(event.keypath + '.searchable', true)
                var input = ractive.get(grandParentOf(event.keypath))
                if (!input.isSubInput) {
                  ractive.fire('patchResource', event, input.predicate, input.rdfType)
                  let valueIndex = Number(_.last(event.keypath.split('.')))
                  if (valueIndex > 0) {
                    ractive.splice(parentOf(event.keypath), valueIndex, 1)
                  }
                  if (input.isMainEntry) {
                    unloadResourceForDomain('Work')
                    unloadResourceForDomain('Person')
                  }
                }
                closest.find('[contenteditable=true]').first().focus()
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
                  Main.restart()
                }
                let waitHandler = ractive.get('waitHandler')
                waitHandler.newWaitable(event.original.target)
                var newResourceType = event.context.createNewResource
                if (newResourceType && (!ractive.get('targetUri.' + newResourceType.type))) {
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
                                  if (targetInput.multiple) {
                                    targetInput.values.push(deepClone(sourceValue))
                                  }
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
                var uriToDelete = ractive.get(`targetUri.${event.context.rdfType}`)
                deleteResource(uriToDelete, event.context, function () {
                  unloadResourceForDomain(event.context.resourceType)
                  if (event.context.afterSuccess) {
                    if (event.context.afterSuccess.setResourceInDocumentUrlFromTargetUri) {
                      var targetUri = ractive.get(`targetUri.${event.context.afterSuccess.setResourceInDocumentUrlFromTargetUri}`)
                      if (targetUri) {
                        updateBrowserLocationWithUri(event.context.afterSuccess.setResourceInDocumentUrlFromTargetUri, targetUri)
                      }
                    }
                    if (event.context.afterSuccess.restart) {
                      Main.restart()
                    }
                    if (event.context.afterSuccess.gotoTab !== undefined) {
                      ractive.fire('activateTab', { keypath: 'inputGroups.' + (event.context.afterSuccess.gotoTab) })
                    }
                  }
                })
              },
              showCreateNewResource: function (event, origin) {
                if (eventShouldBeIgnored(event)) return
                if (!event.context.prefillFromAcceptedSource) {
                  _.each(event.context.inputs, function (input, index) {
                    if (input.type !== 'hidden-url-query-value') {
                      ractive.set(event.keypath + '.inputs.' + index + '.values', emptyValues(false, true))
                    }
                  })
                }
                ractive.set(`${origin}.searchResult.hidden`, true)
                ractive.set(`${grandParentOf(event.keypath)}.showInputs`, event.index.inputValueIndex || 0)
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
                let searchTerm = ractive.get(`${origin}.searchResult.searchTerm`)
                if (searchTerm) {
                  _.each(event.context.inputs, function (input) {
                    if (input.preFillFromSearchField) {
                      input.values[ 0 ].current.value = searchTerm
                    }
                  })
                  ractive.update(event.keypath)
                }
              },
              createNewResource: function (event, origin) {
                let maintenance = origin.indexOf('maintenanceInputs') !== -1
                let displayValueInput = _.find(event.context.inputs, function (input) {
                  return input.displayValueSource === true
                })
                let searchOriginInput = ractive.get(grandParentOf(event.keypath))
                let useAfterCreation = searchOriginInput.useAfterCreation

                let setCreatedResourceUriInSearchInput = function (resourceUri) {
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
                let patchMotherResource = function (resourceUri) {
                  let targetInput = ractive.get(grandParentOf(origin))
                  if (!useAfterCreation && !targetInput.isSubInput) {
                    Main.patchResourceFromValue(ractive.get('targetUri.' + targetInput.rdfType), targetInput.predicate, ractive.get(origin), targetInput.datatypes[ 0 ], errors)
                  }
                  return resourceUri
                }

                function setCreatedResourceValuesInMainInputs () {
                  let groupInputs = ractive.get('inputGroups')
                  _.each(event.context.inputs, function (input) {
                    _.each(groupInputs, function (group) {
                      _.each(group.inputs, function (groupInput) {
                        if (groupInput.predicate === input.predicate && groupInput.rdfType === input.rdfType) {
                          ractive.set(`${groupInput.keypath}.values`, deepClone(input.values))
                        }
                      })
                    })
                  })
                }

                let setTargetUri = function (resourceUri) {
                  if (useAfterCreation) {
                    ractive.set('targetUri.' + event.context.rdfType, resourceUri)
                    updateInputsForDependentResources(event.context.rdfType, resourceUri)
                    ractive.update()
                    updateBrowserLocationWithUri(event.context.rdfType, resourceUri)
                  }
                  return resourceUri
                }
                let clearInputsAndSearchResult = function () {
                  if (ractive.get(origin + '.searchResult')) {
                    ractive.set(origin + '.searchResult', null)
                  }
                  _.each(event.context.inputs, function (input, index) {
                    ractive.set(event.keypath + '.inputs.' + index + '.values', emptyValues(false, true))
                  })
                  ractive.set(event.keypath + '.showInputs', false)
                  ractive.set(grandParentOf(origin) + '.allowAddNewButton', true)
                }
                let nop = function (uri) {
                  return uri
                }
                let originTarget = $(`span[data-support-panel-base-id=support_panel_base_${ractive.get(origin).uniqueId}] span a.support-panel-expander`)
                let wait = ractive.get('waitHandler').newWaitable(originTarget)
                if (useAfterCreation) {
                  setCreatedResourceValuesInMainInputs()
                }
                saveInputs((!maintenance && ractive.get(`${grandParentOf(grandParentOf(event.keypath))}.searchMainResource`)) ? allTopLevelGroupInputsForDomain(event.context.rdfType) : event.context.inputs, event.context.rdfType)
                  .then(setCreatedResourceUriInSearchInput)
                  .then(!maintenance ? patchMotherResource : nop)
                  .then(!maintenance ? setTargetUri : nop)
                  .then(clearInputsAndSearchResult)
                  .then(wait.cancel)
              },
              cancelEdit: function (event) {
                $(event.node).closest('.panel-part').find('span[contenteditable=true]').focus()
                clearSupportPanels()
                ractive.set(grandParentOf(event.keypath) + '.showInputs', null)
              },
              fetchValueSuggestions: function (event) {
                ractive.get('waitHandler').newWaitable(event.original.target)
                var searchValue = event.context.current.value

                function doExternalSearch () {
                  let wait = ractive.get('waitHandler').thisMayTakeSomTime()
                  searchExternalSourceInput.searchForValueSuggestions.hitsFromPreferredSource = []
                  searchExternalSourceInput.searchForValueSuggestions.valuesFromPreferredSource = []
                  _.each(allInputs(), function (input) {
                    input.suggestedValues = null
                  })
                  ractive.update()
                  var sources = ractive.get('applicationData.externalSources') || searchExternalSourceInput.searchForValueSuggestions.sources
                  var promises = []
                  let resultStat = {
                    itemsFromPreferredSource: 0,
                    itemsFromOtherSources: {}
                  }
                  _.each(sources, function (source) {
                    promises.push(axios.get(`/valueSuggestions/${source}/${searchExternalSourceInput.searchForValueSuggestions.parameterName}/${searchValue}`, {
                        headers: {
                          Accept: 'application/ld+json'
                        }
                      }
                    ).then(function (response) {
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
                    })
                      .then(wait.done)
                      .catch(function (error) {
                        errors.push(error)
                        wait.done()
                      }))
                  })
                  Promise.all(promises).then(function () {
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

                if (searchValue && searchValue !== '') {
                  var searchExternalSourceInput = ractive.get(grandParentOf(event.keypath))
                  if (searchExternalSourceInput.searchForValueSuggestions.pattern && !(new RegExp(searchExternalSourceInput.searchForValueSuggestions.pattern).test(searchValue))) {
                    return
                  }
                  if (searchExternalSourceInput.searchForValueSuggestions.checkExistingResource) {
                    ractive.fire('checkExistingResource', event.context.current.value, searchExternalSourceInput.searchForValueSuggestions.checkExistingResource, doExternalSearch)
                  }
                }
              },
              checkExistingResource: function (queryValue, spec, proceed) {
                var searchUrl = proxyToServices(`${spec.url}?${spec.queryParameter}=${queryValue}${_.reduce(spec.showDetails, function (memo, fieldName) {
                  return memo + '&@return=' + fieldName
                }, '')}`)
                axios.get(searchUrl, { headers: { 'x-apicache-bypass': true } }).then(function (response) {
                  let parsed = ldGraph.parse(response.data)
                  let existingResources = parsed.byType(spec.type)
                  if (existingResources.length > 0) {
                    alertAboutExistingResource(spec, _.map(existingResources, function (resource) {
                      var detailsForResource = []
                      _.each(spec.showDetails, function (detail) {
                        let detailValue = resource.getAll(detail)[ 0 ]
                        if (detailValue) {
                          detailsForResource.push(detailValue.value)
                        }
                      })
                      return { uri: resource.id, details: detailsForResource.join(' ') }
                    }), proceed)
                  } else {
                    proceed()
                  }
                })
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
                ractive.set('primarySuggestionAccepted', true)
                let waitHandler = ractive.get('waitHandler')
                waitHandler.newWaitable(event.original.target)
                let waiter = waitHandler.thisMayTakeSomTime()
                setTimeout(function () {
                  let prefillValuesFromExternalSources = ractive.get('applicationData.config.prefillValuesFromExternalSources')
                  _.each(prefillValuesFromExternalSources, function (suggestionSpec) {
                    var domain = suggestionSpec.resourceType
                    var wrappedIn = suggestionSpec.wrappedIn
                    var demandTopBanana = suggestionSpec.demandTopBanana
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
                            let inputsWithValueSuggestionEnabled = _.filter(allInputs(), function (input) {
                                return input.suggestValueFrom
                              }
                            )
                            _.each(inputsWithValueSuggestionEnabled, function (input) {
                              if (input.suggestValueFrom.domain === domain && !wrapperObject) {
                                input.values = input.values || [ { current: {}, old: {} } ]
                                _.each(node.getAll(fragmentPartOf(input.suggestValueFrom.predicate)), function (value, index) {
                                  input.values[ index ].current.displayValue = value.value
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  })
                  let numberOfAdditionalSuggestions = []
                  let sources = []
                  let targets = []
                  let suggestableMap = [] // an array of arrays with flags indicating which inputs may receive additional suggestion values
                  let suggestedMap = []
                  let warnWhenCopyingSubset = []
                  forAllGroupInputs(function (targetInput, groupIndex, inputIndex, subInputIndex) {
                    suggestableMap[ groupIndex ] = suggestableMap[ groupIndex ] || []
                    suggestedMap[ groupIndex ] = suggestedMap[ groupIndex ] || []
                    if (inputHasAcceptedSuggestions(targetInput, inputIndex) && inputCanReceiveAdditionalSuggestions(targetInput)) {
                      suggestableMap[ groupIndex ][ subInputIndex ] = true
                      _.each(targetInput.values, function (value, valueIndex) {
                        if (!value.current || value.current.value === undefined || value.current.value === null || value.current.value === '' || _.isEqual(value.current.value, [ '' ]) ||
                          (targetInput.type === 'searchable-with-result-in-side-panel' && typeof value.current.displayValue !== 'string' || value.current.displayValue === '')) {
                          value.additionalSuggestion = {
                            value: valueOfInputById(targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.inputRef, 0),
                            displayValue: displayValueOfInputById(targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.inputRef, 0)
                          }
                          suggestedMap[ groupIndex ][ subInputIndex ] = suggestedMap[ groupIndex ][ subInputIndex ] || []
                          suggestedMap[ groupIndex ][ subInputIndex ][ valueIndex ] = true
                          numberOfAdditionalSuggestions[ groupIndex ] = numberOfAdditionalSuggestions[ groupIndex ] || [ 0 ]
                          numberOfAdditionalSuggestions[ groupIndex ]++
                          var sourceInput = inputFromInputId(targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.inputRef)
                          sources[ groupIndex ] = sources[ groupIndex ] || []
                          sources[ groupIndex ] = _.union(sources[ groupIndex ], [ inputLabelWithContext(sourceInput) ])
                          targets[ groupIndex ] = targets[ groupIndex ] || []
                          targets[ groupIndex ] = _.union(targets[ groupIndex ], [ inputLabelWithContext(targetInput) ])
                        }
                      })
                      if (targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.warnWhenCopyingSubset) {
                        warnWhenCopyingSubset[ groupIndex ] = targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.warnWhenCopyingSubset
                      }
                    }
                  })
                  var incompleteSuggestions = []
                  _.each(suggestedMap, function (suggestedForGroup, groupIndex) {
                    _.each(suggestedForGroup, function (suggestedForInput, inputIndex) {
                      if (!_.isEqual(suggestedForGroup[ inputIndex ], suggestableMap[ groupIndex ][ inputIndex ])) {
                        incompleteSuggestions[ groupIndex ] = incompleteSuggestions[ groupIndex ] || []
                        incompleteSuggestions[ groupIndex ][ inputIndex ] = true
                      }
                    })
                  })
                  _.each(numberOfAdditionalSuggestions, function (numberOfSuggestionsForGroup, groupIndex) {
                    if (numberOfSuggestionsForGroup > 0) {
                      ractive.set(`inputGroups.${groupIndex}.additionalSuggestions`, {
                        numberOfSuggestionsForGroup: numberOfSuggestionsForGroup,
                        numberOfInCompleteForGroup: _.reduce(incompleteSuggestions[ groupIndex ], function (count, isIncomplete) {
                          return count + isIncomplete ? 1 : 0
                        }, 0),
                        sources: sources[ groupIndex ],
                        targets: targets[ groupIndex ],
                        incompleteSuggestions: incompleteSuggestions[ groupIndex ],
                        warnWhenCopyingSubset: warnWhenCopyingSubset[ groupIndex ],
                        allowPartialSuggestions: warnWhenCopyingSubset[ groupIndex ].allowByDefault,
                        group: groupIndex
                      })
                    }
                  })
                  ractive.update().then(waiter.done)
                })
              },
              useSuggestion: function (event) {
                event.context.suggested = null
                event.context.keepOrder = true
                event.context.suggested = null
                let subInputs = ractive.get(grandParentOf(grandParentOf(event.keypath)))
                _.each(subInputs, function (subInput) {
                  if (typeof subInput.input.values[ event.index.inputValueIndex ].searchable === 'boolean') {
                    ractive.set(`${subInput.input.keypath}.values.${event.index.inputValueIndex}.searchable`, true)
                  }
                  if (typeof subInput.input.values[ event.index.inputValueIndex ].suggested === 'object') {
                    ractive.set(`${subInput.input.keypath}.values.${event.index.inputValueIndex}.suggested`, null)
                  }
                  ractive.set(`${subInput.input.keypath}.values.${event.index.inputValueIndex}.nonEditable`, null)
                })
                ractive.update()
              },
              enableSpecialInput: function (event) {
                enableSpecialInput(event.context)
              },
              showRdf: function (event, resourceUri) {
                showTurtle(proxyToServices(resourceUri) + '?format=TURTLE')
              },
              showReport: function (event, resourceUri) {
                let targetUrl = `/cataloguing?template=report&Publication=${resourceUri}&hideHome=true`
                let query = URI.parseQuery(URI.parse(document.location.href).query)
                if (query.hasMediaType) {
                  targetUrl += `&hasMediaType=${query.hasMediaType}`
                }
                if (query.hasWorkType) {
                  targetUrl += `&hasWorkType=${query.hasWorkType}`
                }
                showOverlay(targetUrl)
              },
              closeCompare: function (event, type) {
                closeCompare(type)
              },
              mergeResources: function (event, targetUri, sourceUri) {
                mergeResources(event.context, targetUri, sourceUri, function () {
                  showGrowler()
                  axios.put(`${proxyToServices(targetUri)}/merge`, { replacee: sourceUri }).then(function () {
                    hideGrowler()
                    closeCompare(typeFromUri(targetUri))
                  }).catch(hideGrowler)
                })
              },
              loadInverseRelated: function (event, parentUri) {
                ractive.set(`${grandParentOf(event.keypath)}.toolMode`, true)
                loadInverseRelated(event, parentUri)
              },
              unloadInverseRelated: function (event) {
                ractive.set(`${event.keypath}.relations`, null)
                ractive.set(`${grandParentOf(event.keypath)}.toolMode`, null)
              },
              cloneParentForEachChild: function (event, parentUri) {
                function patchValue (patchSubject, property, type, oldValue, newValue) {
                  return axios.patch(proxyToServices(patchSubject), [
                      {
                        op: 'del',
                        s: patchSubject,
                        p: `http://data.deichman.no/ontology#${property}`,
                        o: {
                          value: oldValue,
                          type: type
                        }
                      },
                      {
                        op: 'add',
                        s: patchSubject,
                        p: `http://data.deichman.no/ontology#${property}`,
                        o: {
                          value: newValue,
                          type: type
                        }
                      }
                    ],
                    {
                      headers: {
                        Accept: 'application/ld+json',
                        'Content-Type': 'application/ldpatch+json'
                      }
                    }
                  )
                }

                cloneParents(event.context, parentUri, function () {
                  const promises = []
                  showGrowler()
                  _.each(event.context.relations, function (relation, index) {
                    if (relation.enable) {
                      promises.push(axios.post(`${proxyToServices(parentUri)}/clone`)
                        .then(function (response) {
                          return patchValue(relation.uri, event.context.inverseRdfProperty, 'http://www.w3.org/2001/XMLSchema#anyURI', parentUri, response.headers.location).then(function () {
                            return response
                          })
                        }).then(function (response) {
                          const promises = []
                          _.each(_.chain(event.context.transferFieldsToParent).pairs().filter(function (pair) { return pair[ 1 ] === true }).map(function (pair) { return pair[ 0 ] }).value(), function (property) {
                            const input = ractive.get('applicationData.inputMap')[ `${typeFromUri(parentUri)}.http://data.deichman.no/ontology#${property}` ]
                            const newValue = relation.projections[ property ]
                            promises.push(patchValue(response.headers.location, property, typesFromRange(input.ranges[ 0 ]).rdfType, input.values[ 0 ].current.value || '', newValue || ''))
                          })
                          return Promise.all(promises)
                        }))
                    }
                  })
                  Promise.all(promises).then(function () {
                    loadInverseRelated(event, parentUri)
                    ractive.set(`${event.keypath}.transferFieldsToParent.*`, false)
                  }).then(hideGrowler)
                })
              },
              toggleAllEnableRelation: function (event) {
                ractive.set(`${event.keypath}.relations.*.enable`, event.context.selectAll)
              },
              nextRange: function (event) {
                handleRangeShift(event, 'nextRange')
              },
              prevRange: function (event) {
                handleRangeShift(event, 'prevRange')
              },
              openBulkEdit: function (event, args) {
                ractive.set(`${event.keypath}.showSupportPanel`, true)
                ractive.set(`${event.keypath}.multiline`, true)
                const autoNumberInputRef = ractive.get(`${grandParentOf(event.keypath)}.widgetOptions.enableBulkEntry.autoNumberInputRef`)
                if (autoNumberInputRef) {
                  const numberingInput = inputFromInputId(autoNumberInputRef)
                  ractive.set(`${numberingInput.keypath}.values.${_.last(event.keypath.split('.'))}.showAutonumber`, true)
                  ractive.set(`${numberingInput.keypath}.values.${_.last(event.keypath.split('.'))}.autoNumber`, true)
                  var nextNumber = (_
                      .chain(ractive.get(`${numberingInput.keypath}.values`))
                      .pluck('current')
                      .pluck('value')
                      .map(Number)
                      .map(function (value) {
                        return isNaN(value) ? 0 : value
                      })
                      .reduce(function (memo, num) { return Math.max(memo, num) })
                      .value() || 0) + 1
                  ractive.set(`${numberingInput.keypath}.nextNumber`, nextNumber)
                  ractive.observe(`${event.keypath}.current.value ${numberingInput.keypath}.values.${_.last(event.keypath.split('.'))}.autoNumber`, function (newVal, oldVal, keypath) {
                    const textBody = ractive.get(`${event.keypath}.current.value`)
                    if (textBody && ractive.get(`${numberingInput.keypath}.values.${_.last(event.keypath.split('.'))}.autoNumber`)) {
                      var lines = _.compact(textBody.split(/\r\n|\r|\n/)).length
                      ractive.set(`${numberingInput.keypath}.values.${_.last(event.keypath.split('.'))}.current.value`, `${nextNumber}${lines > 1 ? '–' : ''}${lines > 1 ? (nextNumber + lines - 1) : ''}`)
                    }
                  })
                }
                positionSupportPanels()
              }
            }
          )

          ractive.set('inputGroups', applicationData.inputGroups)
          ractive.set('inputs', applicationData.inputs)
          ractive.set('predefinedValues', applicationData.predefinedValues)
          ractive.update()
          return applicationData
        }

        function enableObservers (applicationData, altInputsKeypath) {
          let inputsKeypath = altInputsKeypath || options.inputsKeypath || 'inputGroups.*.inputs'

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

          ractive.set('observers', [
            ractive.observe(`${inputsKeypath}.*.subInputs.0.input.values.*.subjectType`, function (newValue, oldValue, keypath) {
              checkRequiredSubjectTypeSelection(keypath, newValue)
            }, { init: false }),

            ractive.observe(`${inputsKeypath}.*.subInputs.*.input.values.*.current.value`, function (newValue, oldValue, keypath) {
              checkRequiredSubInput(newValue, keypath)
            }, { init: false }),

            ractive.observe(`${inputsKeypath}.*.subInputs.*.input.values.*.nonEditable`, function (newValue, oldValue, keypath) {
              let compoundInputKeypath = grandParentOf(grandParentOf(grandParentOf(keypath)))
              let valueIndex = _.last(parentOf(keypath).split('.'))
              let nonEditableTarget = `${compoundInputKeypath}.subInputs.0.input.values.${valueIndex}.nonEditable`
              if (newValue === true && ractive.get(nonEditableTarget) !== true) {
                ractive.set(nonEditableTarget, true)
              }
            }, { init: false }),

            ractive.observe(`${inputsKeypath}.*.values.0.current.value`, function (newValue, oldValue, keypath) {
              if (Boolean(newValue) !== Boolean(oldValue)) {
                if (!newValue || newValue === '') {
                  var inputKeypath = grandParentOf(grandParentOf(keypath))
                  let dependentResourceTypes = ractive.get(`${inputKeypath}.dependentResourceTypes`)
                  _.each(dependentResourceTypes, function (resourceType) {
                    unloadResourceForDomain(resourceType)
                  })
                }
              }
            }, { init: false }),

            ractive.observe(`${inputsKeypath}.*.values.*`, function (newValue, oldValue, keypath) {
              if (newValue && newValue.current) {
                if (!newValue.current.value) {
                  ractive.set(keypath + '.error', false)
                  return
                }
                var parent = grandParentOf(keypath)
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
            }, { init: false }),

            ractive.observe('inputGroups.*.tabSelected', function (newValue, oldValue, keypath) {
              var groupIndex = keypath.split('.')[ 1 ]
              if (newValue === true) {
                updateBrowserLocationWithTab(groupIndex)
                var additionalSuggestionsForGroup = ractive.get(`inputGroups.${groupIndex}.additionalSuggestions`)
                if (additionalSuggestionsForGroup) {
                  setTimeout(function () {
                    alertAboutAdditionalSuggestions(additionalSuggestionsForGroup, function (allowPartialSuggestions) {
                      forAllGroupInputs(function (input, groupIndex1) {
                        if (groupIndex1 === Number(groupIndex)) {
                          _.each(input.values, function (value, valueIndex) {
                            if ((allowPartialSuggestions || !additionalSuggestionsForGroup.incompleteSuggestions[ valueIndex ]) && value.additionalSuggestion) {
                              ractive.set(`${input.keypath}.values.${valueIndex}.current`, value.additionalSuggestion)
                              ractive.set(`${input.keypath}.values.${valueIndex}.additionalSuggestion`, null)
                            }
                          })
                        }
                      })
                    })
                  })
                } else {
                  copyAdditionalSuggestionsForGroup(groupIndex)
                }
              }
            }, { init: false, defer: true }),

            ractive.observe('applicationData.maintenanceInputs.*.widgetOptions.*.showInputs', function (newValue, oldValue, keypath) {
              var openInputForms = ractive.get('openInputForms') || []
              if (!isNaN(parseInt(newValue))) {
                openInputForms = _.union(openInputForms, [ keypath ])
              } else {
                openInputForms = _.without(openInputForms, keypath)
              }
              ractive.set('openInputForms', openInputForms)
            }, { init: false }) ])
          return applicationData
        }

        function copyAdditionalSuggestionsForGroup (groupIndex) {
          forAllGroupInputs(function (input, groupIndex1) {
            if (groupIndex1 === Number(groupIndex) && input.widgetOptions && input.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom) {
              var sourceInput = inputFromInputId(input.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.inputRef)
              if (sourceInput) {
                var value = _.last(input.values)
                if (value && (!value.current || value.current.value === undefined || value.current.value === null || value.current.value === '' || _.isEqual(value.current.value, [ '' ]) ||
                  (input.type === 'searchable-with-result-in-side-panel' && typeof value.current.displayValue !== 'string' || value.current.displayValue === '') && typeof sourceInput.values[ 0 ] === 'object')) {
                  ractive.set(`${input.keypath}.values.${input.values.length - 1}.current`, {
                    value: sourceInput.values[ 0 ].current.value,
                    displayValue: sourceInput.values[ 0 ].current.displayValue
                  })
                  ractive.set(`${input.keypath}.values.${input.values.length - 1}.searchable`, sourceInput.values[ 0 ].searchable)
                  ractive.set(`${input.keypath}.values.${input.values.length - 1}.deletable`, sourceInput.values[ 0 ].deletable)
                  ractive.set(`${input.keypath}.values.${input.values.length - 1}.subjectType`, input.values[ 0 ].subjectType)
                }
              }
            }
          })
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
          return applicationData
        }

        function loadWorkOfPublication (options) {
          withPublicationOfWorkInput(function (publicationOfInput) {
            var workUri = _.flatten([ publicationOfInput.values[ 0 ].current.value ])[ 0 ]
            if (workUri) {
              return fetchExistingResource(workUri, options).then(function () {
                ractive.set('targetUri.Work', workUri)
              })
            }
          })
        }

        var setDisplayMode = function (applicationData) {
          var query = URI.parseQuery(URI.parse(document.location.href).query)
          if (query.hideHome) {
            $('#home').remove()
          }
          return applicationData
        }

        function showGrowler (applicationData) {
          applicationData = applicationData || {}
          var query = URI.parseQuery(URI.parse(document.location.href).query)
          if (!query.noStartGrowl) {
            $('#growler').show()
          } else {
            $('#growler').hide()
          }
          var growlerSpinner = new Spinner({ scale: 2.0 }).spin()
          $('#growler').find('.save-placeholder').append(growlerSpinner.el)
          applicationData.growlerSpinner = growlerSpinner
          return applicationData
        }

        function hideGrowler (applicationData) {
          setTimeout(function () {
            $('#growler').hide()
          }, 500)
          return applicationData
        }

        var initWaitHandler = function (applicationData) {
          ractive.set('waitHandler', {
            waiters: [],
            newWaitable: function (waitingClassTarget) {
              var target = $(waitingClassTarget)
              var showingWaiting = false
              var cancelled = false
              let spinner = new Spinner({ scale: 1.0 }).spin()
              let waiter = {
                showWaiting: function () {
                  if (!showingWaiting && !cancelled) {
                    showingWaiting = true
                    target.addClass('saving')
                    var next = target.nextAll('.save-placeholder')
                    if (next.length > 0) {
                      next.append(spinner.el)
                    } else {
                      $('#growler').show()
                    }
                    setTimeout(this.done, 10000)
                  }
                },
                done: function () {
                  if (showingWaiting) {
                    spinner.stop()
                    target.removeClass('saving')
                    $('#growler').hide()
                    showingWaiting = false
                  }
                },
                cancel: function () {
                  cancelled = true
                  $('#growler').hide()
                }
              }
              this.waiters.push(waiter)
              return waiter
            },
            thisMayTakeSomTime: function () {
              let waiter = this.waiters.pop()
              if (waiter) {
                waiter.showWaiting()
                return waiter
              } else {
                return {
                  done: function () {
                    // nop
                  }
                }
              }
            }
          })
          return applicationData
        }

        function loadPublication (query, tab) {
          fetchExistingResource(query.Publication)
            .then(loadWorkOfPublication)
            .then(function () {
              ractive.set('targetUri.Publication', query.Publication)
              ractive.fire('activateTab', { keypath: 'inputGroups.' + (tab || '3') })
            })
        }

        function loadOtherResource (query, tab) {
          _.each([
            {
              qualifier: '',
              main: true
            },
            {
              qualifier: 'compare_with_',
              main: false,
              compare: true
            }
          ], function (qualifierSpec) {
            const desiredType = _.find(_.pluck(ractive.get('config.inputForms'), 'rdfType'), function (type) {
              return query[ qualifierSpec.qualifier + type ] && !ractive.get(`targetUri.${query[ qualifierSpec.qualifier + type ]}`)
            })
            if (desiredType) {
              fetchExistingResource(query[ qualifierSpec.qualifier + desiredType ], {
                inputs: ractive.get(`applicationData.flattenedInputsForDomainType.${desiredType}`),
                compareValues: qualifierSpec.compare
              }, desiredType)
                .then(function () {
                  if (qualifierSpec.main) {
                    ractive.set(`targetUri.${desiredType}`, query[ desiredType ])
                    ractive.set('rdfType', desiredType)
                    ractive.set('groupIndex', ractive.get(`applicationData.domainInputGroupIndex.${desiredType}`))
                  }
                  if (qualifierSpec.compare) {
                    ractive.set('compare', true)
                  }
                })
            } else {
              ractive.fire('activateTab', { keypath: 'inputGroups.' + (tab || '0') })
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
                  if (ractiveData.suggestedValues) {
                    ractive.set(ractiveData.keypath, ractiveData.suggestedValues)
                  }
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
                },
                old: {
                  value: value
                }
              } ]
              ractive.update()
              window.sessionStorage.clear()
            }
          }
          if (query.Publication && !ractive.get(`targetUri.${query.Publication}`)) {
            loadPublication(query, tab)
          } else if (query.Work && !ractive.get(`targetUri.${query.Work}`)) {
            loadOtherResource(query, tab)
          } else {
            loadOtherResource(query, tab)
          }
          return applicationData
        }

        var initHeadlineParts = function (applicationData) {
          var headlineParts = []
          forAllGroupInputs(function (input, groupIndex, inputIndex, subInputIndex) {
            if (input.headlinePart) {
              var subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
              var keypath
              var headlinePart = {}
              if (input.type === 'select-predefined-value') {
                headlinePart.predefinedValue = true
                keypath = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.values.0.current.value[0]`
              } else {
                var valuePart = input.type === 'searchable-with-result-in-side-panel' ? 'displayValue' : 'value'
                keypath = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.values.0.current.${valuePart}`
              }
              headlinePart.keypath = keypath
              headlinePart.fragment = input.fragment
              ractive.set(`${input.keypath}.headlinePart`, headlinePart)
              headlineParts.push(headlinePart)
            }
          })
          ractive.set('applicationData.headlineParts', headlineParts)
          return applicationData
        }

        var initInputLinks = function (applicationData) {
          var inputLinks = {}
          forAllGroupInputs(function (input, groupIndex, inputIndex, subInputIndex) {
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
          let setInputVisibility = function (inputKeypath, visible) {
            ractive.set(`${inputKeypath}.visible`, Boolean(visible).valueOf())
              .then(positionSupportPanels)
              .then(Main.repositionSupportPanelsHorizontally)
          }
          forAllGroupInputs(function (input) {
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
            _.each(input.dependentResourceTypes, function (type) {
              ractive.observe(`targetUri.${type}`, function (newValue, oldValue, keypath) {
                if (typeof newValue === 'string' && newValue !== '') {
                  fetchExistingResource(newValue, { inputs: [ input ] })
                }
              })
              ractive.observe(`${applicationData.inputLinks[ input.id ]}.values.0.current.value`, function (newValue, oldValue, keypath) {
                if (typeof newValue === 'string' && newValue !== '') {
                  if (ractive.get(`targetUri.${type}`) !== newValue && !isBlankNodeUri(newValue)) {
                    fetchExistingResource(newValue)
                  }
                }
              }, { init: false })
            })
          }, { handleInputGroups: true })
          return applicationData
        }

        let initValuesFromQuery = function (applicationData) {
          _.each(allInputs(), function (input) {
            if (input.widgetOptions && input.widgetOptions.queryParameter &&
              ((options.presetValues || {})[ input.widgetOptions.queryParameter ] || query[ input.widgetOptions.queryParameter ])) {
              let queryValue = (input.widgetOptions.prefix || '') + ((options.presetValues || {})[ input.widgetOptions.queryParameter ] || query[ input.widgetOptions.queryParameter ])
              if (queryValue) {
                input.values = [ {
                  current: {
                    value: [ queryValue ]
                  },
                  old: {
                    value: undefined
                  }
                } ]
                ractive.update(input.keypath)
              }
            }
          })
          setTaskDescription(query.task)
          return applicationData
        }

        let initTitle = function (applicationData) {
          forAllGroupInputs(function (input) {
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

        let workaroundContentEditableBugs = function (applicationData) {
          // WebKit contentEditable focus bug workaround:
          if (/AppleWebKit\/([\d.]+)/.exec(navigator.userAgent)) {
            var editableFix = $('<input style="width:1px;height:1px;border:none;margin:0;padding:0;" tabIndex="-1">').appendTo('html')
            $('[contenteditable]').blur(function () {
              editableFix[ 0 ].setSelectionRange(0, 0)
              editableFix.blur()
            })
          }

          // workaround for <div> being inserted into search field when selecting exact match result item with enter key
          $(document).on('DOMNodeInserted', $.proxy(function (e) {
            if (e.target.parentNode.getAttribute('contenteditable') === 'true') {
              var newTextNode = document.createTextNode('')
              let antiChrome = function (node) {
                if (node.nodeType === 3) {
                  newTextNode.nodeValue += node.nodeValue.replace(/(\r\n|\n|\r)/gm, '')
                } else if (node.nodeType === 1 && node.childNodes) {
                  for (var i = 0; i < node.childNodes.length; ++i) {
                    antiChrome(node.childNodes[ i ])
                  }
                }
              }
              antiChrome(e.target)
              e.target.parentNode.replaceChild(newTextNode, e.target)
            }
          }, this))
          return applicationData
        }

        let etags = {}
        axios.interceptors.request.use(function (options) {
          let url = options.url
          options.now = Date.now()
          if (options.method === 'get' || !options.method) {
            options.validateStatus = function (status) {
              return status >= 200 && status < 300 || status === 304
            }
            const etag = etags[ url ]
            const cachedResponse = etagData[ `${url}${etag}` ]
            if (cachedResponse) {
              options.cachedResponse = cachedResponse
              if (etag) {
                options.headers[ 'If-None-Match' ] = etag
              }
              options.headers[ 'Access-Control-Expose-Headers' ] = 'ETag'
            } else {
              etags[ url ] = undefined
            }
          }
          return options
        }, function (error) {
          return Promise.reject(error)
        })

        axios.interceptors.response.use(function (response) {
          var etag
          let url = response.config.url
          if (response.status === 304 && (etag = response.headers.etag)) {
            let cachedData = etagData[ `${url}${etag}` ]
            if (cachedData) {
              response.status = 200
            }
            return cachedData
          }
          if (response.status === 200) {
            const responseEtag = response.headers.etag

            if (responseEtag) {
              etagData[ `${url}${responseEtag}` ] = deepClone(response)
              etags[ url ] = responseEtag
            }
          }
          return response
        }, function (error) {
          return Promise.reject(error)
        })

        return axios.get('/config')
          .then(showGrowler)
          .then(extractConfig)
          .then(loadTemplate)
          .then(loadPartials)
          .then(loadOntology)
          .then(createInputGroups)
          .then(initSelect2)
          .then(initRactive)
          .then(initWaitHandler)
          .then(enableObservers)
          .then(loadResourceOfQuery)
          .then(positionSupportPanels)
          .then(initHeadlineParts)
          .then(initInputLinks)
          .then(initInputInterDependencies)
          .then(initTitle)
          .then(initValuesFromQuery)
          .then(workaroundContentEditableBugs)
          .then(setDisplayMode)
          .then(function (applicationData) {
            setTaskDescription(options.task)
            if (options.template) {
              updateBrowserLocationWithTemplate(options.template)
            }
            $(document).keyup(function (e) {
              if (e.keyCode === 27) {
                closePreview()
              }
            })
            return applicationData
          })
          .then(function (applicationData) {
            $('.focusguard-end').on('focus', function () {
              $('.focusguard-start.visible + div :input:first').focus()
            })

            $('.focusguard-start').on('focus', function () {
              $('a:last').focus()
            })
            return applicationData
          })
          .then(hideGrowler)
        // .catch(function (err) {
        //   console.log('Error initiating Main: ' + err)
        // })
      },
      repositionSupportPanelsHorizontally: function () {
        supportPanelLeftEdge = $('#right-dummy-panel').position().left
        supportPanelWidth = $('#right-dummy-panel').width()

        if (supportPanelLeftEdge > 0) {
          $('.support-panel').each(function (index, panel) {
            $(panel).css({ left: supportPanelLeftEdge, width: supportPanelWidth })
          })
        }
      },
      getRactive: function () {
        return ractive
      },
      $: $,
      _: _,
      etagData: etagData,
      saveSuggestionData: saveSuggestionData,
      checkRangeStart: checkRangeStart,
      checkRangeEnd: checkRangeEnd,
      positionSupportPanels: positionSupportPanels,
      ISBN: ISBN,
      Ractive: Ractive
    }
    return Main
  }
))
