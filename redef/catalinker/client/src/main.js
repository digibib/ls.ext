/*global window,history*/
/**
 * This file operates on a Ractive (https://ractive.js.org/) data structure representing inputs to create and edit RDF
 * resources through the REST API provided by the ls.ext/redef/services module which stores the data in a triple store.
 * Resources are a set of RDF triples, and are in principle general, but Publications and Works are treated specially.
 * Other types may be Persons, Places, Events, (general) Subjects etc.
 *
 * The general idea is that input data structures are two-way bound to html input elements, such as text fields select
 * lists etc, implemented as Ractive partials. When a value is changed by the user, the previous value, which is kept in
 * the input data structure, is compared with the new one, and an HTTP PATCH with the content-type application/ldpatch+json
 * is dispatched to the services backend. Thus the RDF triple for the old value is deleted, and a triple for the new value is
 * added to the triple store. In effect a property is updated. New values only result in PATH with only an add part.
 *
 * Each input is configured with which resource type/domain is belongs to, e.g. 'Work', and which predicate, e.g. 'mainTitle'.
 * The actual resource uri is stored in a map in the ractive structure, 'targetUri'. That way, by combing a changed
 * input's old value, new value, predicate, domain and uri obtained by resolving targetUri[domain] (e.g. targetUri['Work']),
 * a PATCH may be created.
 *
 * Input structures look like this:
 *
 * input
 *   +- id            an id for household and referring purposes, e.g. 'mainTitleInput'. Must be unique.
 *   +- domain        which resource type the input belongs to
 *   +- rdfProperty   shorthand form of RDF predicate the input maps to e.g. 'mainTitle'
 *   +- type          e.g. 'input-string', 'searchable-with-result-in-side-panel', 'select-predefined-value'
 *   +- multiple      whether to allow more than one value
 *   +- labelKey      a key represented in i18n files
 *   +- values        array with value structures
 *        +- 0
 *        |  +- current
 *        |  |     +- value   One of the actual values. If type is select dropdown, all values are store as an array here
 *        |  |     +- displayValue If value is an uri referring to another resource, this is a more user-freindly display value, e.g. name
 *        |  +- old
 *        |        +- value   The previous value
 *        |
 *        +- 1
 *           +- current
 *           |     +- value
 *           |     +- displayValue
 *           |
 *           +- old
 *                 +- value
 *
 * Inputs may also be of a compound type, and have subInputs. This is used to handle blank nodes, by wrapping
 * other fields.
 *
 * Inputs are grouped, facilitating displaying them in tabs. For presentation purposes, some inputs are decorated by
 * properties like 'firstInGroup', 'lastInGroup', 'cssClassPrefix', 'orderBy', 'showOnlyWhen', 'placeHolder' etc.
 *
 * inputGroups
 *    +- 0
 *    |   +- domain      Which domain/resource type the tab is concerned with
 *    |   +- tabLabel    Key to label of tab
 *    |   +- inputs      Inputs of this tab
 *    |   |     +- 0
 *    |   |        +- id
 *    |   |        +- ...
 *    |   |
 *    |   |     +- 1
 *    |   |        +- id
 *    |   |        +- ...
 *    |   |
 *    |   +- nextStep
 *    |   |     +- buttonLabel  Key to label of button to go to next tab
 *    |   |     +- ...
 *    |   |
 *    |   +- tools
 *    |        +- 0
 *    |           +- template    Name of a ractive partial that implements a special purpose tool, e.g. to split work
 *    |
 *    +- 1
 *       +- domain
 *       +- ...
 *
 *  The input structure is initalised by compining the application configuration, obtained from the backend, with the ontology from
 *  the same source, since the ontology does not define much regarding presentation. The main driver for this approach
 *  is the grouping of inputs into tabs definfing the workflow. In addition, the input order is thus configurable, along
 *  with properties like cardinality, property label overrides etc.
 *
 *  All inputs are represented in a flat array as well, called 'inputs' in the Ractive structure.
 *
 *  Input structures may also have additional configuration, as a property called 'widgetOptions'. widgetOptions may e.g. refer
 *  to definitions of popup forms, which are lists of inputs used to create or edit related resources on the fly. Say an
 *  input has type='searchable-with-results-in-side-panel'. Its behaviour is to hold an uri pointing to resource, e.g. a Person,
 *  but display that person's name as displayValue. To set the uri value, a search is performed, and the user may select an existing
 *  resource found in from the search this setting the value to the person's uri and displayValue to his/her name, or the
 *  user can create a new instance. For this purpose, the create popup form is shown.
 *
 *  To enable comparing tho resources of the same type side-by-side, values in the 'other' resource may be stored in 'compareValues'
 *  field of input, rather than 'values' field.
 */
(function (root, factory) {
  'use strict'

  if (typeof module === 'object' && module.exports) {
    const Ractive = require('ractive')
    Ractive.events = require('ractive-events-keys')
    const axios = require('axios')
    const Graph = require('./graph')
    const Ontology = require('./ontology')
    const StringUtil = require('./stringutil')
    const NestedPropertyHelper = require('./nestedPropertyHelper')
    const _ = require('underscore')
    const $ = require('jquery')
    const ldGraph = require('ld-graph')
    const URI = require('urijs')
    const esquery = require('./esquery')
    require('isbn2')
    module.exports = factory(Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI, window.ISBN, esquery, NestedPropertyHelper)
  } else {
    // Browser globals (root is window)
    root.Main = factory(root.Ractive, root.axios, root.Graph, root.Ontology, root.StringUtil, root._, root.$, root.ldGraph, root.URI, root.ISBN, root.esquery, root.nestedPropertyHelper)
  }
}(this, function (Ractive, axios, Graph, Ontology, StringUtil, _, $, ldGraph, URI, ISBN, esquery, nestedPropertyHelper) {
    'use strict'

    /**
     * This function clears all inputs for the supplied domain type.
     *
     * @param domainType Clear only inputs with this domain
     * @param excludeInputs  Leave these inputs alone
     * @returns {Promise.<TResult>|*}
     */
    const unloadResourceForDomain = function (domainType, excludeInputs) {
      excludeInputs = excludeInputs || []
      const subjectTypesOfInputValue = {}
      // determine subject type for value indexes for comound inputs
      forAllGroupInputs(function (input) {
        if (!excludeInputs.includes(input.id) && input.isSubInput && input.parentInput.domain && domainType === unPrefix(input.parentInput.domain)) {
          _.each(input.values, function (value, index) {
            const detectedSubjectType = (_.chain(input.parentInput.subInputs).pluck('input').pluck('values').find(function (values) {
              return (values[ index ] && values[ index ].subjectType) ? values[ index ].subjectType : undefined
            }).first().value() || {}).subjectType
            if (detectedSubjectType) {
              subjectTypesOfInputValue[ input.parentInput ] = subjectTypesOfInputValue[ input.parentInput ] || []
              subjectTypesOfInputValue[ input.parentInput ][ index ] = detectedSubjectType
            }
          })
        }
      })
      forAllGroupInputs(function (input) {
        if (!excludeInputs.includes(input.id)) {
          if (input.domain && domainType === unPrefix(input.domain)) {
            let subjectType = input.values[ 0 ].subjectType
            input.values = emptyValues(input.type === 'select-predefined-value', input.searchable)
            input.values[ 0 ].subjectType = subjectType
            input.values[ 0 ].oldSubjectType = subjectType
          } else if (input.isSubInput && input.parentInput.domain && domainType === unPrefix(input.parentInput.domain)) {
            const valuesToRemove = []
            _.each(input.values, function (value, index) {
              if (subjectTypesOfInputValue[ input.parentInput ][ index ] === domainType) {
                valuesToRemove.push(index)
              }
            })
            const promises = []
            _.each(valuesToRemove.reverse(), function (index) {
              promises.push(ractive.splice(`${input.keypath}.values`, index, 1))
            })
            Promise.all(promises).then(function () {
              let values = ractive.get(`${input.keypath}.values`)
              if (values.length === 0) {
                ractive.set(`${input.keypath}.values`, emptyValues(input.type === 'select-predefined-value', input.searchable))
                if (input.parentInput.subjectTypes.length === 1) {
                  ractive.set(`${input.keypath}.values.0.subjectType`, input.parentInput.subjectTypes[ 0 ])
                }
              }
            })
          }
        }
      })
      updateBrowserLocationWithUri(domainType, undefined)
      return ractive.set(`targetUri.${domainType}`, undefined).then(ractive.update())
    }
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
    const translations = {
      no: require('./i18n/no_nb'),
      en: require('./i18n/en')
    }
    let etagData = {}
    require('isbn2')
    ISBN = ISBN || window.ISBN // I think this was needed because of extra parameter 'dialog' in init above
    const Spinner = require('spin')

    const deepClone = function (object) {
      const clone = _.clone(object)

      _.each(clone, function (value, key) {
        if (_.isObject(value)) {
          clone[ key ] = deepClone(value)
        }
      })

      return clone
    }
    const utils = require('./utils')

    const ensureJSON = utils.ensureJSON
    const proxyToServices = utils.proxyToServices
    const isPromise = utils.isPromise

    function unPrefix (prefixed) {
      return _.last(prefixed.split(':'))
    }

    function checkRangeStart (input) {
      const endRangeInput = $(input).closest('.input').next().find('input')
      const rangeEndVal = Number(endRangeInput.val())
      const startRangeVal = Number($(input).val())
      if (!isNaN(startRangeVal) && (isNaN(rangeEndVal) || rangeEndVal < startRangeVal)) {
        endRangeInput.val(Math.max(startRangeVal, rangeEndVal))
        ractive.updateModel()
      }
    }

    function checkRangeEnd (input) {
      const startRangeInput = $(input).closest('.input').prev().find('input')
      const rangeStartVal = Number(startRangeInput.val())
      const endRangeVal = Number($(input).val())
      if (!isNaN(endRangeVal) && (isNaN(rangeStartVal) || rangeStartVal > endRangeVal)) {
        startRangeInput.val(Math.min(endRangeVal, rangeStartVal))
        ractive.updateModel()
      }
    }

    /**
     * This function saves to the browser's sessiom store data that are fetched from external source but has not yet been saved in triple store.
     * This is in case the user reloads the page, giving possibility to continue a fairer chance.
     * @param event
     * @returns {boolean}
     */
    function saveSuggestionData (event) {
      let suggestionData = []
      let acceptedData = []
      let unknownPredefinedValues = []
      let supportableInputs = []
      let unIdentifiedAuthorities = false
      _.each(ractive.get('inputGroups'), function (group, groupIndex) {
        _.each(group.inputs, function (input, inputIndex) {
          const realInputs = input.subInputs ? _.map(input.subInputs, function (subInput) {
            return subInput.input
          }) : [ input ]
          _.each(realInputs, function (input, subInputIndex) {
            if (!unIdentifiedAuthorities && input.type === 'searchable-with-result-in-side-panel') {
              _.each(input.values, (value) => {
                if ((value.current.displayValue || '').length > 0 && (!value.current.value || value.current.value.length === 0)) {
                  unIdentifiedAuthorities = true
                }
              })
            }
            const subInputFragment = input.isSubInput ? `subInputs.${subInputIndex}.input.` : ''
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
            if (input.unknownPredefinedValues) {
              unknownPredefinedValues.push({
                keypath: `inputGroups.${groupIndex}.inputs.${inputIndex}.unknownPredefinedValues`,
                value: input.unknownPredefinedValues
              })
            }
            if (input.supportable) {
              supportableInputs.push({
                keypath: `inputGroups.${groupIndex}.inputs.${inputIndex}.supportable`,
                value: true
              })
            }
          })
        })
      })
      window.sessionStorage.setItem('suggestionData', JSON.stringify(suggestionData))
      window.sessionStorage.setItem('acceptedData', JSON.stringify(acceptedData))
      window.sessionStorage.setItem('unknownPredefinedValues', JSON.stringify(unknownPredefinedValues))
      window.sessionStorage.setItem('supportableInputs', JSON.stringify(supportableInputs))
      let suggestedValueSearchInput = getSuggestedValuesSearchInput()
      if (suggestedValueSearchInput) {
        window.sessionStorage.setItem(suggestedValueSearchInput.searchForValueSuggestions.parameterName, suggestedValueSearchInput.values[ 0 ].current.value)
      }
      if (unIdentifiedAuthorities) {
        if (!URI.parseQuery(URI.parse(document.location.href).query).noOnloadWarning) {
          return false
        }
      }
    }

    function inputHasOpenForm (input) {
      let inputHasOpenForm = false
      if (input.widgetOptions) {
        inputHasOpenForm = _.some(_.pick(input.widgetOptions, 'enableEditResource'), function (action) {
          return !isNaN(Number.parseInt(action.showInputs))
        })
      }
      return inputHasOpenForm
    }

    /**
     * Hides all open support panels.
     * @param options
     */
    function clearSupportPanels (options) {
      let changes = false
      const keepActions = (options || {}).keep || []
      _.each(allInputs(), function (input) {
        _.each(input.values, function (value) {
          if (value && value.searchResult && !inputHasOpenForm(input)) {
            value.searchResult = null
            changes = true
          }
        })
      })
      _.each(ractive.get('applicationData.maintenanceInputs'), function (input, index) {
        if (ractive.get(`applicationData.maintenanceInputs.${index}.widgetOptions.enableEditResource.showInputs`) !== undefined) {
          if (input.widgetOptions) {
            _.each(_.difference([ 'enableEditResource' ], keepActions), function (action) {
              if (input.widgetOptions[ action ]) {
                input.widgetOptions[ action ].showInputs = null
                changes = true
                if (!isNaN(Number.parseInt(input.widgetOptions[ action ].showInputs))) {
                  const domainType = input.widgetOptions[ action ].forms[ input.selectedIndexType ].rdfType
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

    const translate = _.memoize(function (msgKey) {
      return ractive.get('applicationData.translations')[ ractive.get('applicationData.language') ][ msgKey ]
    })

    /**
     * Shows the delete resource dialog, and calls the success function when donw..
     * @param uri
     * @param deleteConfig
     * @param success called when deletion is completed
     */
    const deleteResource = function (uri, deleteConfig, success) {
      if (!deleteConfig.dialogKeypath) {
        deleteConfig.dialogKeypath = 'deleteResourceDialog'
        ractive.update()
      }
      deleteConfig.dialogId = deleteConfig.dialogId || 'delete-resource-dialog'
      ractive.set(`${deleteConfig.dialogKeypath}.uri`, uri)
      axios.get(proxyToServices(`${uri}/references`)).then(function (response) {
        let totalNumberOfReferences = 0
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
        const idPrefix = _.uniqueId()
        $(`#${deleteConfig.dialogId}`).dialog({
          resizable: false,
          modal: true,
          width: 450,
          buttons: [
            {
              text: translate('delete'),
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
              text: translate('cancel'),
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
            if (totalNumberOfReferences > 0 && deleteConfig.preventDeleteIfReferred) {
              $(`#${idPrefix}-do-del`).hide()
            }
            $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
          }
        })
      })
    }

    /**
     * Shows dialog that ask the user to show a particular input that is usually hidden.
     * @param enableSpecialInputSpec
     */
    const enableSpecialInput = function (enableSpecialInputSpec) {
      ractive.set('confirmEnableSpecialInputDialog.confirmLabel', enableSpecialInputSpec.confirmLabel)
      let keypath = ractive.get(`inputLinks.${enableSpecialInputSpec.inputId}`)
      $('#confirm-enable-special-input-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        title: translate(enableSpecialInputSpec.buttonLabel),
        buttons: [
          {
            text: translate('proceed'),
            click: function () {
              ractive.set(`${keypath}.visible`, true)
              $(this).dialog('close')
            }
          },
          {
            text: translate('cancel'),
            click: function () {
              $(this).dialog('close')
            }
          }
        ]
      })
    }

    /**
     * Shows dialog to initiate merging of resources/extended edit.
     *
     * @param mergeResourcesSpec
     * @param targetUri
     * @param sourceUri
     * @param proceed
     */
    const mergeResources = function (mergeResourcesSpec, targetUri, sourceUri, proceed) {
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
          title: translate('mergeResourcesDialogTitle'),
          buttons: [
            {
              text: translate('proceed'),
              click: function () {
                $(this).dialog('close')
                proceed()
              }
            },
            {
              text: translate('cancel'),
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

    /**
     * Shows dialog to clone/split parent resource
     * @param cloneParentSpec
     * @param parentUri
     * @param proceed
     */
    const cloneParents = function (cloneParentSpec, parentUri, proceed) {
      $('#clone-parent-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        title: translate(cloneParentSpec.cloneParentDialogTitle),
        buttons: [
          {
            text: translate('proceed'),
            click: function () {
              $(this).dialog('close')
              proceed()
            }
          },
          {
            text: translate('cancel'),
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

    const warnEditResourceName = function (editResourcesSpec) {
      ractive.set('editResourceWarning', editResourcesSpec)
      $('#edit-resource-warning-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        title: `Endre ${editResourcesSpec.fieldLabel}?`,
        buttons: [
          {
            text: translate('proceed'),
            click: function () {
              $(this).dialog('close')
              editResourcesSpec.proceed()
            }
          },
          {
            text: translate('cancel'),
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

    /**
     * Shows dialog that warns about an existing resource, e.g. with same ISBN
     * @param spec
     * @param existingResources
     * @param proceed
     */
    const alertAboutExistingResource = function (spec, existingResources, proceed) {
      ractive.set('existingResourcesDialog.existingResources', existingResources)
      ractive.set('existingResourcesDialog.legend', existingResources.length > 1 ? spec.legendPlural : spec.legendSingular)
      ractive.set('existingResourcesDialog.editResourceConfig', spec.editWithTemplate)
      $('#alert-existing-resource-dialog').dialog({
        resizable: false,
        modal: true,
        width: 550,
        title: translate('thisPublicationIsAlreadyRegistered'),
        class: 'existing-resources-dialog',
        buttons: [
          {
            text: translate('proceed'),
            click: function () {
              $(this).dialog('close')
              proceed()
            }
          },
          {
            text: translate('cancel'),
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

    /**
     * Shows dialog that warns that there are addiotnal suggestions which may be used.
     * @param spec
     * @param proceed
     */
    const alertAboutAdditionalSuggestions = function (spec, proceed) {
      ractive.set('additionalSuggestionsDialog', spec)
      $('#additional-suggestions-dialog').dialog({
        resizable: false,
        modal: true,
        width: 550,
        title: translate('suggestedPrefilledValues'),
        class: 'additionl-suggestions-dialog',
        buttons: [
          {
            text: translate('useSuggestion'),
            class: 'default',
            click: function () {
              $(this).dialog('close')
              proceed(ractive.get('additionalSuggestionsDialog.allowPartialSuggestions'))
            }
          },
          {
            text: translate('ignore'),
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

    /**
     * Shows dialog that initiates copying of a resource.
     * @param copyPublicationSpec
     * @param proceed
     * @param success
     */
    const copyPublication = function (copyPublicationSpec, proceed, success) {
      const idPrefix = _.uniqueId()
      $('#copy-resource-dialog').dialog({
        resizable: false,
        modal: true,
        width: 450,
        buttons: [
          {
            text: translate('proceed'),
            id: `${idPrefix}-do-copy`,
            click: function () {
              $(`#${idPrefix}-do-copy`).button('disable')
              proceed().then(function () {
                $(`#${idPrefix}-ok-copy`).show()
                $(`#${idPrefix}-do-copy`).hide()
                $('#copy-resource-dialog').find('a').click(function () {
                  setTimeout(function () {
                    $('#copy-resource-dialog').dialog('close')
                  })
                  return true
                })
              })
            }
          },
          {
            text: translate('cancel'),
            id: `${idPrefix}-cancel-copy`,
            class: 'default',
            click: function () {
              $(this).dialog('close')
            }
          },
          {
            text: 'Ok',
            id: `${idPrefix}-ok-copy`,
            click: function () {
              $(this).dialog('close')
              $('body').addClass('copy')
              if (success) {
                success()
              }
            }
          }
        ],
        open: function () {
          $(`#${idPrefix}-ok-copy`).hide()
          $(this).siblings('.ui-dialog-buttonpane').find('button.default').focus()
        },
        close: function () {
          ractive.set('copyPublicationProgress', null)
          ractive.set('clonedPublicationUri', null)
          ractive.set('error', null)
        }
      })
    }

    function i18nLabelValue (label, lang) {
      lang = lang || 'no'
      if (ractive) {
        lang = ractive.get('applicationData.language') || lang
      }
      if (Array.isArray(label)) {
        return _.find(label, function (labelValue) {
          return (labelValue[ '@language' ] === lang)
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

    /**
     * Sets values into an input representing select from predefined values
     * @param values
     * @param input
     * @param index
     * @param options
     *     compareValues=true sets values in 'compareValues' rather than 'values' field.
     *     demoteAcceptedSuggestions=true moves existing values that stem from external source to suggested values
     *     initialLoad=true means that this is loading from a resource. old and current are set equal so subsequent changes are detectable
     * @returns {Array}
     */
    function setMultiValues (values, input, index, options) {
      options = options || {}
      if (values) {
        const valuesAsArray = values.length === 0 ? [] : _.chain(values)
          .map(value => {
            if (isBlankNodeUri(value.id)) {
              let valuesForInput = ractive.get(`applicationData.predefinedValues.${input.fragment}`)
              let matchedPredefValue = _.find(valuesForInput, function (predefValue) {
                return _.some(predefValue.label, function (label) {
                  return label[ '@language' ] === value.get('label').lang && label[ '@value' ] === value.get('label').value
                })
              })
              if (matchedPredefValue) {
                return matchedPredefValue[ '@id' ]
              } else {
                input.supportable = true
                input.unknownPredefinedValues = input.unknownPredefinedValues || {}
                input.unknownPredefinedValues.values = input.unknownPredefinedValues.values || []
                input.unknownPredefinedValues.values.push((value.get('label') || {}).value)
                input.unknownPredefinedValues.sourceLabel = input.unknownPredefinedValues.sourceLabel || options.sourceLabel
              }
            }
            return value.id
          })
          .filter(id => !isBlankNodeUri(id))
          .value()
        if (options.compareValues) {
          input.compareValues = input.compareValues || emptyValues()
        }
        let valuesKey = options.compareValues ? 'compareValues' : 'values'
        if (!input[ valuesKey ][ index ]) {
          input[ valuesKey ][ index ] = {}
        } else if (options.noOverwrite && input[ valuesKey ][ index ].current && input[ valuesKey ][ index ].current.value && input[ valuesKey ][ index ].current.value.length > 0) {
          return
        }
        if (options.demoteAcceptedSuggestions) {
          _.chain([ input ]).pluck(valuesKey).pluck(index).pluck('current').pluck('accepted').compact().first().pairs().each(valueAndSource => {
            const value = valueAndSource[ 0 ]
            const source = valueAndSource[ 1 ]
            input.suggestedValues = input.suggestedValues || []
            input.suggestedValues.push({
              source,
              value: {
                value,
                label: Main.predefinedLabelValue(input.fragment, value)
              }
            })
            input.suggestionsAreDemoted = true
            delete input[ valuesKey ][ index ].current.accepted[ value ]
            ractive.update(`${input}.${valuesKey}.current.accepted`)
          })
        }
        if (options.initialLoad) {
          input[ valuesKey ][ index ].old = input[ valuesKey ][ index ].old || {}
          input[ valuesKey ][ index ].old.value = valuesAsArray
        }
        input[ valuesKey ][ index ].current = input[ valuesKey ][ index ].current || {}
        input[ valuesKey ][ index ].current.value = valuesAsArray
        input[ valuesKey ][ index ].current.uniqueId = _.uniqueId()

        _.chain(values).filter(value => value.source).each(acceptedValueAndSource => {
          input[ valuesKey ][ index ].current.accepted = input[ valuesKey ][ index ].current.accepted || {}
          input[ valuesKey ][ index ].current.accepted[ acceptedValueAndSource.id ] = acceptedValueAndSource.source
        })

        input[ valuesKey ][ index ].uniqueId = _.uniqueId()
        if (options.onlyValueSuggestions) {
          input[ valuesKey ][ index ].suggested = { source: options.source }
          input.suggestedValues = valuesAsArray
        } else if (options.source) {
          input[ valuesKey ][ index ].current.accepted = input[ valuesKey ][ index ].current.accepted || {}
          _.chain(valuesAsArray).filter(val => val).each((value) => {
            input[ valuesKey ][ index ].current.accepted[ value ] = options.source
          })
          setSuggestionsAreAcceptedForParentInput(input, index)
        }
        ractive.update(`${input.keypath}.${valuesKey}.${index}`)
        return valuesAsArray
      }
    }

    /**
     * Sets a literal or uri value
     * @param value
     * @param input
     * @param index
     * @param options
     *     compareValues=true sets value in 'compareValues' rather than 'values' field.
     *     demoteAcceptedSuggestions=true moves existing value that stem from external source to suggested values
     *     initialLoad=true means that this is loading from a resource. old and current are set equal so subsequent changes are detectable
     */
    function setSingleValue (value, input, index, options) {
      options = options || {}
      if (options.compareValues) {
        input.compareValues = input.compareValues || emptyValues()
      }
      const valuesKey = options.compareValues ? 'compareValues' : 'values'
      if (options.noOverwrite && input[ valuesKey ][ index ] && input[ valuesKey ][ index ].current && input[ valuesKey ][ index ].current.value) {
        return
      }
      if (options.demoteAcceptedSuggestions) {
        const acceptedSource = _.chain([ input ]).pluck(valuesKey).pluck(index).pluck('current').pluck('accepted').pluck('source').compact().first().value()
        if (acceptedSource) {
          input.suggestedValues = input.suggestedValues || []
          input.suggestedValues.push({
            source: acceptedSource,
            value: input[ valuesKey ][ index ].current.value
          })
          input.suggestionsAreDemoted = true
        }
      }
      input[ valuesKey ][ index ] = {
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
      if (input[ valuesKey ][ index ].current.accepted) {
        setSuggestionsAreAcceptedForParentInput(input, index)
      }
      ractive.update(`${input.keypath}.${valuesKey}.${index}`)
    }

    function setIdValue (id, input, index, valuesField, options) {
      options = options || {}
      input[ valuesField ] = input[ valuesField ] || []
      if (!input[ valuesField ][ index ]) {
        input[ valuesField ][ index ] = {}
      } else if (options.noOverwrite) {
        return
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
        if (propNameCore.indexOf('@') === 0) {
          return nestedPropertyHelper[ propNameCore.substring(1) ](node)
        } else {
          let propVal = (node.getAll(propNameCore)[ 0 ] || { value: undefined }).value
          if (propVal === undefined) {
            propVal = (node.outAll(propNameCore)[ 0 ] || { 'id': undefined }).id
          }
          return propVal
        }
      }
    }

    /**
     * Sets the display value of an input with values that are uris pointing to other resources
     * @param input
     * @param index
     * @param root a previously parsed linked data graph containing the resource to fetch display data from
     * @param options
     * @returns {*}
     */
    function setDisplayValue (input, index, root, options) {
      options = options || {}
      let valuesField = options.valuesField || 'values'
      let uri = input[ valuesField ][ index ].current.value
      if (input.type === 'searchable-authority-dropdown') {
        uri = uri[ 0 ]
      }
      if (!uri || uri === '') {
        return
      }

      function fromRoot (root) {
        function getValues (onlyFirstField) {
          return new Promise((resolve, reject) => {
            const displayProperties = getDisplayProperties(input.nameProperties || [ 'name', 'prefLabel' ], valuePropertyFromNode(root), indexTypeFromNode(root))
            const handleDisplayProperties = () => {
              resolve(_.pluck(displayProperties || [], 'val')
                .slice(onlyFirstField ? 0 : undefined, onlyFirstField ? 1 : undefined)
                .join(' ')
                .replace(/[,\.:]\s*$/g, '')
                .replace(/- /, '-')
                .replace(/: /g, ' : '))
            }
            if (isPromise(displayProperties)) {
              return displayProperties.then(handleDisplayProperties)
            } else {
              return handleDisplayProperties(displayProperties)
            }
          })
        }

        getValues(options.onlyFirstField).then((values) => {
          const typeMap = ractive.get('applicationData.config.typeMap')
          let selectedIndexType
          _.each(input.indexTypes, function (indexType) {
            if (root.isA(typeMap[ indexType ])) {
              selectedIndexType = indexType
            }
          })
          if ((options.onlyFirstField || (input.nameProperties || []).length === 1) && /^\[.*\]$/.test(values)) {
            input[ valuesField ][ index ].bracketed = true
            values = values.replace('[', '').replace(']', '')
          }

          const multiple = input.isSubInput ? input.parentInput.multiple : input.multiple
          if (options.onlyValueSuggestions) {
            if (multiple) {
              input[ valuesField ][ index ].suggested = {
                source: options.source,
                selectedIndexType: selectedIndexType
              }
              input[ valuesField ][ index ].current.displayValue = values
            } else {
              getValues().then(function (value) {
                ractive.set(`${input.keypath}.suggestedValues.${index}`, {
                    value: values,
                    displayValue: value,
                    source: options.source,
                    selectedIndexType: selectedIndexType
                  }
                )
              })
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
        })
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
          const graphData = ensureJSON(response.data)
          const root = ldGraph.parse(graphData).byId(uri)
          fromRoot(root)
        })
      }
    }

    /**
     * Determines whether an input should be shown or not based on one or more values from other inputs and the document's url's query parameters
     * @param input input which shuld be checked
     * @param allInputs check against alle these inputs
     * @returns {boolean}
     */
    function checkShouldInclude (input, allInputs) {
      let shouldInclude = true
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

    /**
     * Checks whether an input is considered esoteric (rarely used), and if it should be shown or not.
     * @param input
     * @param allInputs
     * @returns {boolean}
     */
    function checkEsoteric (input, allInputs) {
      let isEsoteric = (input.esotericWhen || undefined) === 'always'
      let handleInput = function (includeWhenValues, property) {
        return function (input) {
          if (input.fragment === property && _.contains(includeWhenValues, _.flatten([
              fragmentPartOf(URI.parseQuery(document.location.href)[ property ] ||
                _.flatten([ input.values[ 0 ].current.value ])[ 0 ])
            ])[ 0 ])) {
            isEsoteric = true
            return true
          }
        }
      }
      if (input.esotericWhen) {
        if (input.type === 'select-predefined-value') {
          if (input.values && (input.values[ 0 ].current.value.length > 0 || input.values[ 0 ].old.value.length > 0)) {
            input.showEsoteric = true
          }
        } else if (input.values && (((input.values[ 0 ].current.value || '') !== '') || ((input.values[ 0 ].old.value || '') !== ''))) {
          input.showEsoteric = true
        }
        if (input.subInputs && input.subInputs[ 0 ].input.values && (((input.subInputs[ 0 ].input.values[ 0 ].current.value || '') !== '') ||
            ((input.subInputs[ 0 ].input.values[ 0 ].old.value || '') !== ''))) {
          input.showEsoteric = true
        }
        _.each(_.keys(input.esotericWhen), function (property) {
          let includeWhenValues = _.flatten([ input.esotericWhen[ property ] ])
          if (allInputs) {
            _.find(allInputs, handleInput(includeWhenValues, property))
          } else {
            forAllGroupInputs(handleInput(includeWhenValues, property))
          }
        })
      }
      return isEsoteric
    }

    function advancedSearchCharacters () {
      return ':+-^()´"*'
    }

    function updateBrowserLocationWithUri (type, resourceUri) {
      const oldUri = URI.parse(document.location.href)
      let queryParameters = URI.parseQuery(oldUri.query)
      const prefix = type.startsWith('compare_with_') ? 'compare_with_' : ''
      const triumphRanking = { [`${prefix}Work`]: 1, [`${prefix}Publication`]: 2 }
      const parametersPresentInUrl = _.keys(queryParameters)
      const triumph = _.reduce(parametersPresentInUrl, function (memo, param) {
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
      const oldUri = URI.parse(document.location.href)
      const queryParameters = URI.parseQuery(oldUri.query)
      queryParameters[ 'openTab' ] = tabNumber
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
      ractive.set('openTab', '' + (tabNumber || '0'))
    }

    function updateBrowserLocationWithTemplate (template) {
      const oldUri = URI.parse(document.location.href)
      const queryParameters = URI.parseQuery(oldUri.query)
      queryParameters[ 'template' ] = template
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
      updateBrowserLocationWithTab(undefined)
    }

    function updateBrowserLocationWithSuggestionParameter (parameter, value) {
      const oldUri = URI.parse(document.location.href)
      const queryParameters = URI.parseQuery(oldUri.query)
      queryParameters.acceptedSuggestionsFrom = `${parameter}:${value}`
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
    }

    function updateBrowserLocationWithQueryParameter (parameter, value) {
      const oldUri = URI.parse(document.location.href)
      const queryParameters = URI.parseQuery(oldUri.query)
      queryParameters[ parameter ] = value
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
    }

    function updateBrowserLocationClearAllExcept (keep) {
      const oldUri = URI.parse(document.location.href)
      const queryParameters = URI.parseQuery(oldUri.query)
      for (let param in queryParameters) {
        if (!keep.includes(param)) {
          delete queryParameters[ param ]
        }
      }
      oldUri.query = URI.buildQuery(queryParameters)
      history.replaceState('', '', URI.build(oldUri))
    }

    function loadLabelsForAuthorizedValues (values, input, index, root) {
      const promises = []
      if (input.nameProperties) {
        _.each(values, function (uri) {
          function fromRoot (root) {
            const names = _.reduce(input.nameProperties, function (parts, propertyName) {
              const all = root.getAll(propertyName)
              _.each(all, function (value, index) {
                if (!parts[ index ]) {
                  parts[ index ] = []
                }
                parts[ index ].push(value.value)
              })
              return parts
            }, [])

            _.each(names, function (nameParts) {
              const label = nameParts.join(' - ')
              ractive.set(`authorityLabels.${uri.replace(/[:\/\.]/g, '_')}`, label)
              input.values[ index ].current.displayName = label
              $(`#sel_${input.values[ index ].uniqueId}`).trigger('change')
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
              const graphData = ensureJSON(response.data)
              const root = ldGraph.parse(graphData).byId(uri)
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

    /**
     * This function traverses all inputs in all input groups and applies the supplied function to each. The function receives
     * parameters for the input, griup index input index within group and for sub inputs the index within the parent input's inputs.
     *
     * If options.handleInputGroups is defined, it handles the compound inputs themselves as well.
     */
    function forAllGroupInputs (handleInput, options) {
      options = options || {}
      _.find(options.inputGroups || _.compact(ractive.get('inputGroups')), function (group, groupIndex) {
        return _.find(_.compact(group.inputs), function (input, inputIndex) {
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

    /**
     * Returns all inputs from groups, 'maintenence' inputs and inputs in popup forms
     */
    function allInputs () {
      let inputs = _.select(ractive.get('inputs'), function (input) {
        return (input.fragment === 'publicationOf' || input.fragment === 'recordId')
      })

      const addInput = function (input, groupIndex, inputIndex, subInputIndex) {
        inputs.push(input)
        const subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
        const forms = ractive.get(`applicationData.inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.widgetOptions.enableEditResource.forms`)
        if (forms) {
          _.each(forms, function (form) {
            inputs = inputs.concat(form.inputs)
          })
        }
      }

      forAllGroupInputs(addInput)

      _.each(ractive.get('applicationData.maintenanceInputs'), function (input, index) {
        inputs.push(input)
        const forms = (ractive.get(`applicationData.maintenanceInputs.${index}.widgetOptions.enableEditResource.forms`))
        if (forms) {
          _.each(forms, function (form) {
            inputs = inputs.concat(form.inputs)
          })
        }
      })
      return inputs
    }

    /**
     * Special function that finds input for Publication's publicationOf and applies function to it.
     * @param handler
     */
    function withPublicationOfWorkInput (handler) {
      const publicationOfInput = _.find(allInputs(), function (input) {
        return (input.fragment === 'publicationOf' && input.domain === 'deichman:Publication' && input.type === 'searchable-with-result-in-side-panel')
      })
      if (publicationOfInput) {
        handler(publicationOfInput)
      }
    }

    /**
     * Finds input by inputId
     * @param inputId
     */
    function inputFromInputId (inputId) {
      let keypath = ractive.get(`inputLinks.${inputId}`)
      if (keypath) {
        return ractive.get(keypath)
      }
    }

    const memoizedTypeMap = _.memoize(function () {
      return ractive.get('applicationData.config.typeMap')
    })

    /**
     * Determines resource type based on uri
     * @param resourceUri
     * @returns {*}
     */
    function typeFromUri (resourceUri) {
      const typeMap = memoizedTypeMap()
      const allTypes = _.keys(typeMap).join('|')
      return typeMap[ resourceUri.match(`^.*\/(${allTypes})\/.*$`)[ 1 ] ]
    }

    function getDisplayProperties (properties, valueFromPropertyFunc, type) {
      let parensStarted

      function checkEndParens (propName, ornamented) {
        if (parensStarted && propName.indexOf(')') !== -1) {
          ornamented += ')'
          parensStarted = false
        }
        return ornamented
      }

      function ornament (unornamented, propName) {
        let ornamented = unornamented
        let checkEndPunctuation = false
        _.each([ '.', ',', '/', ':' ], function (seperator) {
          if (propName.lastIndexOf(seperator) >= propName.length - 2) {
            ornamented += (seperator === ':' ? ': ' : seperator)
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
          ornamented += '-'
        }
        ornamented = checkEndParens(propName, ornamented)
        if (checkEndPunctuation && /.\)$/.test(ornamented)) {
          ornamented = ornamented.replace('.)', ').')
        }
        return ornamented
      }

      let promises = []
      let realPromisesWereMade = false
      let values = []
      _.each(properties, function (propSpec) {
        var propName
        if (typeof propSpec === 'object') {
          propName = propSpec[ _.find(_.keys(propSpec), function (key) { return new RegExp(key).test(type) }) ]
        } else {
          propName = propSpec
        }
        if (propName) {
          var propNameCore = propName.split(/\.fragment|[#\.,:\(\)-]/).join('')
          const propValue = valueFromPropertyFunc(propNameCore)
          if (propValue) {
            const handleValue = propVal => {
              const displayProperties = []
              if (propVal && propVal !== '') {
                let property = { prop: propNameCore }
                let ornamented
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
              return displayProperties
            }
            if (isPromise(propValue)) {
              realPromisesWereMade = true
              promises.push(propValue.then(handleValue))
            } else {
              const value = handleValue(propValue)
              promises.push(Promise.resolve(value))
              values.push(value)
            }
          }
        }
      })
      if (realPromisesWereMade) {
        return Promise.all(promises).then(promiseValues => {
          return _.flatten(promiseValues)
        })
      } else {
        return _.flatten(values)
      }
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

    /**
     * Updates values in all inputs or a subset with data from graph data. Traverse through all inputs that has supplied type
     * as domain transfers values from graph into the input values.
     * @param graphData parsed graph data
     * @param resourceUri
     * @param options
     * @param root
     * @param type
     */
    function updateInputsForResource (graphData, resourceUri, options, root, type) {
      options = options || {}
      const valuesField = options.compareValues ? 'compareValues' : 'values'
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
              let ownerValueIndex = ownerInput.values.map(value => value.current.value).indexOf(root.id)
              ractive.set(`${inputParentOfCreateNewResourceFormKeypath}.suggestedValuesForNewResource.${ownerValueIndex}`, root)
              skipRest = true
            } else {
              if (!onlyDoSuggestionForCreateNewResource) {
                const rangeStart = (options.range || {}).start || 0
                const rangeLength = options.disablePagination ? 10000 : (options.range || {}).rangeLength || ((input.parentInput || {}).pagination || 10000)
                const loadForRangeOfInputs = function (startIndex, rangeLength) {
                  return function (_root) {
                    _root = _root || root
                    input.offset = input.offset || {}
                    let offset = (input.type !== 'select-predefined-value' && input.multiple) ? (_.filter(input.values || [], (val) => ![ undefined, '', null ].includes(val.current.value))).length : 0
                    if (input.isSubInput) {
                      offset = 0
                    }
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
                          let values = setMultiValues(root.outAll(fragmentPartOf(predicate)), input, rootIndex, options)
                          promises = promises.concat(loadLabelsForAuthorizedValues(values, input, 0, root))
                        } else if (input.type === 'searchable-with-result-in-side-panel' || input.type === 'searchable-authority-dropdown') {
                          if (!(input.suggestValueFrom && options.onlyValueSuggestions)) {
                            _.each(these(root.outAll(fragmentPartOf(predicate))).orIf(input.isSubInput).atLeast([ { id: '' } ]), function (node, multiValueIndex) {
                              index = (input.isSubInput ? rootIndex : multiValueIndex) + (offset)
                              setIdValue(input.type === 'searchable-authority-dropdown' ? [ node.id ] : node.id, input, index, valuesField, options)
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
                              if (node.type === 'string') {
                                input.suggestedValues = input.suggestedValues || []
                                input.suggestedValues.push({
                                  value: node.value,
                                  displayValue: node.value,
                                  source: options.source
                                })
                              }
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
                            _
                              .chain(root.outAll(fragmentPartOf(predicate)))
                              .filter(value => !isBlankNodeUri(value.id))
                              .each(value => {
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
                        } else {
                          _.each(
                            these(_.union(root.getAll(fragmentPartOf(predicate)), _.map(root.outAll(fragmentPartOf(predicate)), (node) => ({ value: node.id }))))
                              .orIf(input.isSubInput || options.compareValues)
                              .atLeast([ { value: '' } ]), (value, index) => {
                              if (!options.onlyValueSuggestions) {
                                let valueIndex = input.isSubInput ? rootIndex : index
                                setSingleValue(value, input, (valueIndex) + (offset), _.extend(options, { setNonEditable: input.isSubInput && !options.source }))
                                input[ valuesField ][ valueIndex ].subjectType = type
                                input[ valuesField ][ valueIndex ].oldSubjectType = type
                                if (input.isSubInput && !options.source) {
                                  input[ valuesField ][ valueIndex ].nonEditable = true
                                  ractive.set(`${input.parentInput.keypath}.subInputs.0.input.${valuesField}.${valueIndex}.nonEditable`, true)
                                  input.parentInput.allowAddNewButton = true
                                } else if (input.multiple) {
                                  input.allowAddNewButton = true
                                }
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
                    if (input.parentInput && input.parentInput.pagination) {
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
                      if (actualRoots.length > rangeLength) {
                        const fromEnd = actualRoots.length - startIndex
                        ractive.splice(`${input.keypath}.${valuesField}`, fromEnd, Math.max(input.parentInput.pagination - fromEnd, 0))
                      }
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
          ractive.set('save_status', translate('statusOpenedExistingResource'))
          if (!(options || {}).compareValues) {
            ractive.set(`targetUri.${type}`, resourceUri)
          }
          updateBrowserLocationWithUri(`${options.compareValues ? 'compare_with_' : ''}${type}`, resourceUri)
        }
      })
    }

    const fetchExistingResource = function (resourceUri, options) {
      options = options || {}
      return axios.get(proxyToServices(resourceUri), {
          headers: {
            Accept: 'application/ld+json'
          }
        }
      )
        .then(function (response) {
            if (response.status === 200) {
              updateInputsForResource(ensureJSON(response.data), resourceUri, Object.assign(options, { initialLoad: true }))
              if (!options.keepDocumentUrl) {
                ractive.set(`targetUri.${options.compareValues ? 'compare_with_' : ''}${typeFromUri(resourceUri)}`, resourceUri)
              }
            }
          }
        )
        .catch(function (err) {
          console.log(`HTTP GET ${resourceUri} existing resource failed with:`)
          console.log(err)
        })
    }

    /**
     * Saves values from inputs as a new resource
     * @param inputsToSave
     * @param resourceType
     * @returns {Promise.<TResult>|*}
     */
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
      const errors = []
      let uri = ractive.get('config.resourceApiUri')
      let lowerCaseResourceType = resourceType.toLowerCase()
      let resourceTypeAlias = ractive.get('config.resourceTypeAliases')[ lowerCaseResourceType ] || lowerCaseResourceType
      return axios.post(`${uri}${resourceTypeAlias}`,
        {}, { headers: { Accept: 'application/ld+json', 'Content-Type': 'application/ld+json' } })
        .then(function (response) {
          const resourceUri = response.headers.location
          let patchBatch = []
          _.each(inputsToSave, function (input) {
            const predicate = input.predicate
            _.each(input.values, function (value) {
              const patches = Ontology.createPatch(resourceUri, predicate, value, input.datatypes[ 0 ])
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

    const saveNewResourceFromInputs = function (resourceType) {
      // collect inputs related to resource type

      const inputsToSave = []
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
        ractive.set(`targetUri.${resourceType}`, resourceUri)
        updateBrowserLocationWithUri(resourceType, resourceUri)
      })
    }

    const loadPredefinedValues = function (url, property) {
      return axios.get(proxyToServices(url), {
          headers: {
            Accept: 'application/ld+json'
          }
        }
      )
        .then(function (response) {
          const values = ensureJSON(response.data)
          // resolve all @id uris
          values[ '@graph' ].forEach(function (v) {
            v[ '@id' ] = Ontology.resolveURI(values, v[ '@id' ])
          })

          const valuesSorted = values[ '@graph' ].sort(function (a, b) {
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

    /**
     *
     * In the following section, configuration data is combined with ontology to set up initial input group structure
     *
     */

    /**
     * Returns a new structure for empty values.
     * @param predefined
     * @param searchable
     * @returns {[null]}
     */
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
      input.visible = (prop.type !== 'entity' && !prop.initiallyHidden)
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
      if (prop.esotericWhen) {
        input.esotericWhen = prop.esotericWhen
      }
      if (prop.isTitleSource) {
        input.isTitleSource = prop.isTitleSource
      }
      if (prop.dependentResourceTypes) {
        input.dependentResourceTypes = prop.dependentResourceTypes
      }
    }

    const lastFoundOrActualLast = function (lastIndexOfVisible, numberOfInputs) {
      return lastIndexOfVisible === -1 ? numberOfInputs - 1 : lastIndexOfVisible
    }

    const markFirstAndLastInputsInGroup = function (group) {
      for (let ix = 0; ix < group.inputs.length; ix++) {
        group.inputs[ ix ].firstInGroup = undefined
        group.inputs[ ix ].lastInGroup = undefined
      }
      (_.findWhere(group.inputs, { visible: true }) || {}).firstInGroup = true;
      (group.inputs[ lastFoundOrActualLast(_.findLastIndex(group.inputs, function (input) { return input.visible === true }), group.inputs.length) ] || {}).lastInGroup = true
    }

    /**
     * determines input type based on RDF range property value
     * @param range
     * @returns {{inputType: *, rdfType: *}}
     */
    const typesFromRange = function (range) {
      let inputType
      let rdfType = range
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
        case 'http://www.w3.org/2001/XMLSchema#integer':
          inputType = 'input-integer'
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
        case 'deichman:CataloguingSource':
        case 'http://www.w3.org/2001/XMLSchema#anyURI':
          rdfType = 'http://www.w3.org/2001/XMLSchema#anyURI'
          inputType = 'input-string'
          break
        default:
          throw new Error(`Don't know which input-type to assign to range: ${range}`)
      }
      return {
        inputType: inputType,
        rdfType: rdfType
      }
    }

    function assignInputTypeFromRange (input) {
      const types = typesFromRange(input.ranges[ 0 ])
      input.type = types.inputType
      input.datatypes = [ types.rdfType ]
    }

    function assignUniqueValueIds (input) {
      _.each(input.values, function (value) {
        value.uniqueId = _.uniqueId()
      })
    }

  /**
   * Sets up the input group structure
   * @param applicationData
   * @returns {Promise.<TResult>|*}
     */
    function createInputGroups (applicationData) {
      const props = Ontology.allProps(applicationData.ontology)
      const inputs = []
      const inputMap = {}
      const inputsForDomainType = {}
      const predefinedValues = []
      applicationData.predefinedValues = {}
      applicationData.predefVals = {}
      applicationData.allLabels = {}
      applicationData.propertyLabels = {}
      for (let i = 0; i < props.length; i++) {
        let disabled = false
        if (props[ i ][ 'http://data.deichman.no/ui#editable' ] !== undefined && props[ i ][ 'http://data.deichman.no/ui#editable' ] !== true) {
          disabled = true
        }

        // Fetch predefined values, if required
        const predicate = Ontology.resolveURI(applicationData.ontology, props[ i ][ '@id' ])
        const valuesFrom = props[ i ][ 'http://data.deichman.no/utility#valuesFrom' ]
        if (valuesFrom) {
          const url = valuesFrom[ '@id' ]
          predefinedValues.push(loadPredefinedValues(url, props[ i ][ '@id' ]))
        }
        const ranges = props[ i ][ 'rdfs:range' ]
        const datatypes = _.isArray(ranges) ? _.pluck(ranges, '@id') : [ ranges[ '@id' ] ]
        const domains = props[ i ][ 'rdfs:domain' ]
        _.each(domains, function (domain) {
          if (_.isObject(domain)) {
            domain = domain[ '@id' ]
          }
          const predefined = valuesFrom
          const fragment = predicate.substring(predicate.lastIndexOf('#') + 1)
          let label = i18nLabelValue(props[ i ][ 'rdfs:label' ], applicationData.language)
          applicationData.propertyLabels[ fragment ] = label
          const input = {
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
            dataAutomationId: `${unPrefix(domain)}_${predicate}_0`,
            visible: true
          }

          if (input.predefined) {
            input.type = 'select-predefined-value'
            input.datatypes = [ 'http://www.w3.org/2001/XMLSchema#anyURI' ]
          } else {
            assignInputTypeFromRange(input)
          }
          inputs.push(input)
          inputMap[ `${unPrefix(domain)}.${input.predicate}` ] = input
          inputsForDomainType[ unPrefix(domain) ] = inputsForDomainType[ unPrefix(domain) ] || []
          inputsForDomainType[ unPrefix(domain) ].push(input)
        })
      }
      const inputGroups = []
      const ontologyUri = applicationData.ontology[ '@context' ][ 'deichman' ]

      const createInputForCompoundInput = function (compoundInput, tab, ontologyUri, inputMap) {
        const currentInput = {
          type: 'compound',
          labelKey: compoundInput.label,
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
          let inputFromOntology = deepClone(inputMap[ `${compoundInput.subInputs.range}.${ontologyUri}${subInput.rdfProperty}` ])
          if (!inputFromOntology) {
            throw new Error(`Property "${subInput.rdfProperty}" doesn't have "${compoundInput.subInputs.range}" in its domain`)
          }
          assignUniqueValueIds(inputFromOntology)
          const indexTypes = _.isArray(subInput.indexTypes) ? subInput.indexTypes : [ subInput.indexTypes ]
          const type = subInput.type || inputFromOntology.type
          const newSubInput = {
            input: _.extend(_.clone(inputFromOntology), {
              labelKey: subInput.label,
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
          // prefill vetoes according to inputs' requiredness
          if (subInput.required) {
            currentInput.inputGroupRequiredVetoes.push(`${subInputIndex}`)
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
        if (input.widgetOptions && input.widgetOptions.enableEditResource) {
          input.widgetOptions.enableEditResource.forms = {}
          _.each(input.widgetOptions.enableEditResource.formRefs, function (formRef) {
            const resourceForm = deepClone(_.find(applicationData.config.inputForms, function (formSpec) {
              return formSpec.id === formRef.formId
            }))
            _.each(resourceForm.inputs, function (formInput) {
              const predicate = ontologyUri + formInput.rdfProperty
              const ontologyInput = inputMap[ `${resourceForm.rdfType}.${predicate}` ]
              if (formInput.label) {
                formInput.labelkey = formInput.label
              }
              _.extend(formInput, _.omit(ontologyInput, formInput.type ? 'type' : ''))
              formInput.values = emptyValues(false)
              formInput.rdfType = resourceForm.rdfType
              if (targetResourceIsMainEntry) {
                formInput.targetResourceIsMainEntry = true
              }
              if (!input.widgetOptions.maintenance) {
                if (!input.id) {
                  throw new Error(`Input ${input.label} must have id since it has a create resource form ref`)
                }
                formInput.belongsToCreateResourceFormOfInput = input.id
                input.suggestedValuesForNewResource = []
              }
            })
            input.widgetOptions.enableEditResource.forms[ formRef.targetType ] = {
              inputs: resourceForm.inputs,
              rdfType: resourceForm.rdfType,
              labelForCreateButton: resourceForm.labelForCreateButton,
              prefillFromAcceptedSource: resourceForm.prefillFromAcceptedSource,
              popupForm: true,
              templateResourcePartsFrom: resourceForm.templateResourcePartsFrom
            }
            const form = input.widgetOptions.enableEditResource.forms[ formRef.targetType ]
            _.each(form.inputs, function (input) {
              input.belongsToForm = form
            })
          })
        }
      }

      function createInputsForGroup (inputGroup, groupIndex) {
        const groupInputs = []
        _.each(inputGroup.inputs, function (input, index) {
          let ontologyInput
          if (input.searchMainResource) {
            groupInputs.push({
              labelKey: input.searchMainResource.label,
              placeHolder: input.searchMainResource.placeHolder,
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
              labelKey: input.searchForValueSuggestions.label,
              placeHolder: input.searchForValueSuggestions.placeHolder,
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
              ontologyInput = inputMap[ `${inputGroup.rdfType}.${ontologyUri}${input.rdfProperty}` ]
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
              ontologyInput.labelKey = input.label
            }
            if (input.showOnlyWhenInputHasValue) {
              ontologyInput.showOnlyWhenInputHasValue = input.showOnlyWhenInputHasValue
            }
          }
          copyResourceForms(input)
        })
        return groupInputs
      }

      const configInputsForVisibleGroup = function (inputGroup, index) {
        const group = { groupIndex: index }
        group.inputs = createInputsForGroup(inputGroup, index)
        group.tabLabel = inputGroup.label
        group.reportLabel = inputGroup.reportLabel
        group.tabId = inputGroup.id
        group.tabSelected = false
        group.domain = inputGroup.rdfType
        group.rdfType = inputGroup.rdfType
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

      const searchIndexForType = {}
      _.each(_.pairs(applicationData.config.rdfTypeToIndexType), function (pair) {
        searchIndexForType[ pair[ 0 ] ] = pair[ 1 ]
      })

      // sort arrays of inputs for each domain type according to order in corresponding forms
      const maintenanceForms = _.chain(applicationData.maintenanceInputs)
        .pluck('widgetOptions').pluck('enableEditResource').compact().pluck('forms').value()

      _.each(maintenanceForms, function (form) {
        const formContent = _.chain(form).pairs().first().value()
        let inputOrderMap = {}
        const readonlyness = {}
        _.each(formContent[ 1 ].inputs, function (input, index) {
          inputOrderMap[ input.predicate ] = index
          if (input.readOnly) {
            readonlyness[ input.predicate ] = true
          }
        })
        const type = formContent[ 1 ].rdfType
        inputsForDomainType[ type ] = _.sortBy(inputsForDomainType[ type ], function (prop) {
          return inputOrderMap[ prop.predicate ]
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
              applicationData.allLabels[ predefVal[ '@id' ] ] = i18nLabelValue(predefVal.label, applicationData.language)
            })
          }
        })
        _.each(_.pairs(applicationData.propertyLabels), function (pair) {
          applicationData.allLabels[ `http://data.deichman.no/ontology#${pair[ 0 ]}` ] = pair[ 1 ]
        })
        return applicationData
      })
    }

  /**
   * Utility that returns gradnparent of supplid keypath i.e. two dots up
   * @param keypath
   */
    function grandParentOf (keypath) {
      return _.initial(_.initial(keypath.split('.'))).join('.')
    }

    function parentOf (keypath) {
      return _.initial(keypath.split('.')).join('.')
    }

    function visitInputs (mainInput, visitor) {
      _.each(mainInput.subInputs ? _.pluck(mainInput.subInputs, 'input') : [ mainInput ], visitor)
    }

  /**
   * Positions support panels to align with inputs they are supposed to support.
   * @param applicationData
   * @param tabId
   * @returns {*}
     */
    function positionSupportPanels (applicationData, tabId) {
      tabId = undefined
      const dummyPanel = $('#right-dummy-panel')
      if (dummyPanel.length > 0) {
        const supportPanelLeftEdge = dummyPanel.position().left
        const supportPanelWidth = dummyPanel.width()
        let lastShowEsotericLinksPanelBottom = { [tabId || 'all']: 0 }
        $(`${tabId ? `#${tabId} ` : ''}span.support-panel`).each(function (index, panel) {
          const $panel = $(panel)
          const _tabId = tabId || $panel.closest('.grid-panel').attr('id') || 'all'
          const supportPanelBaseId = $panel.attr('data-support-panel-base-ref')
          let supportPanelBase = $(`span:visible[data-support-panel-base-id=${supportPanelBaseId}] div.search-input`)
          if (supportPanelBase.length === 0) {
            supportPanelBase = $(`span[data-support-panel-base-id=${supportPanelBaseId}]`)
          }
          let offset = 15
          if (supportPanelBase.length === 0) {
            supportPanelBase = $(`span:visible[data-support-panel-base-id=${supportPanelBaseId}]`)
            if (supportPanelBase.length > 0) {
              offset = Math.max(0, (80 - supportPanelBase.height()) / 2)
            }
          }
          if ($panel.hasClass('fixed')) {
            offset = 0
          } else if ($panel.hasClass('no-offset')) {
            offset = 40
          }
          if (supportPanelBase.length > 0) {
            let top = _.last(_.flatten([ supportPanelBase ])).position().top - offset
            if ($panel.hasClass('show-esoterics') && lastShowEsotericLinksPanelBottom[ _tabId ] > 0 && top < lastShowEsotericLinksPanelBottom[ _tabId ] + 10) {
              top = Math.max(top, lastShowEsotericLinksPanelBottom[ _tabId ] + 10)
            }
            $panel.css({
              top: (top > 0 ? top : 216) + ($panel.closest('.input-panel.esoteric-hidden').index() === 0 ? 39 : 0),
              left: supportPanelLeftEdge,
              width: supportPanelWidth,
              'z-index': ($panel.hasClass('show-esoterics') ? 100 : 200) - index
            })
            if ($panel.hasClass('show-esoterics') && ($panel.css('display') !== 'none')) {
              lastShowEsotericLinksPanelBottom[ _tabId ] = top + $panel.height()
            }
          }
        })
      }
      return applicationData
    }

    function externalSourceHitDescription (graph, source, sourceLabel) {
      let workGraph = graph.byType('Work')[ 0 ]
      if (!workGraph) {
        throw new Error(`Feil i data fra ekstern kilde (${source}). Mangler data om verket.`)
      }
      let mainHitLine = []
      let supplHitLine = []
      let detailsHitLine = []
      let publicationGraph = graph.byType('Publication')[ 0 ]
      if (!publicationGraph) {
        throw new Error(`Feil i data fra ekstern kilde (${source}). Mangler data om utgivelsen.`)
      }
      mainHitLine = _.map(publicationGraph.getAll('mainTitle'), function (prop) {
        return prop.value
      })
      supplHitLine = _.map(publicationGraph.getAll('untranscribedTitle'), function (prop) {
        return prop.value
      })
      detailsHitLine = _.map(publicationGraph.getAll('publicationYear'), function (prop) {
        return prop.value
      })

      _.each(workGraph.outAll('contributor'), function (contributor) {
        if (contributor.isA('MainEntry')) {
          const agent = contributor.out('agent')
          detailsHitLine.push(agent.get('name').value)
        }
      })
      return {
        main: mainHitLine.join(' - '),
        supplementary: supplHitLine.join(' - '),
        details: detailsHitLine.join(' - '),
        graph,
        source,
        sourceLabel
      }
    }

    function isBlankNodeUri (uri) {
      return uri && /^_:/.test(uri)
    }

    function getSuggestedValuesSearchInput () {
      return _.find(_.flatten(_.pluck(ractive.get('inputGroups'), 'inputs')), function (input) {
        return input.searchForValueSuggestions && checkShouldInclude(input)
      })
    }

    function valueOfInputByInputId (inputId) {
      let input = _.find(allInputs(), function (input) {
        return inputId === input.id
      })
      return input ? input.values[ 0 ].current[ input.type === 'searchable-with-result-in-side-panel' ? 'displayValue' : 'value' ] : undefined
    }

    function mainEntryContributor (contributionTarget) {
      const author = _.find(contributionTarget.contributors, function (contributor) {
        return contributor.mainEntry
      })
      if (author) {
        const creatorAgent = author.agent
        contributionTarget.creator = creatorAgent.name
        if (creatorAgent.birthYear) {
          contributionTarget.creator += `, ${creatorAgent.birthYear}-`
          if (creatorAgent.deathYear) {
            contributionTarget.creator += creatorAgent.deathYear
          }
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
      const txt = document.createElement('textarea')
      txt.innerHTML = html
      return txt.value
    }

    function processSearchResultNavigation (results, config, indexType, fieldForSortedListQuery, searchString) {
      let items = _.map(_.pluck(results.hits.hits, '_source'),
        Main.searchResultItemHandlers[ config.search[ indexType ].itemHandler || 'defaultItemHandler' ])
      let highestScoreIndex
      _.each(items, function (item, index) {
        if (!highestScoreIndex && item.score === results.hits.max_score) {
          highestScoreIndex = index
        }
      })
      let exactMatchWasFound = false
      if (items.length > 0 && highestScoreIndex !== undefined && fieldForSortedListQuery && searchString.toLocaleLowerCase() === _.flatten([ items[ highestScoreIndex ][ fieldForSortedListQuery ] ]).join().toLocaleLowerCase()) {
        items[ highestScoreIndex ].exactMatch = true
        exactMatchWasFound = true
      }
      return { items, highestScoreIndex, exactMatchWasFound }
    }

    function tabIdFromKeypath (keypath) {
      return (keypath.match(/^inputGroups\.([0-9])/) || [])[ 1 ]
    }

    function doSearch (event, searchString, preferredIndexType, secondaryIndexType) {
      positionSupportPanels()
      searchString = stripHtml(searchString).trim()

      if (!searchString) {
        if (ractive.get(`${event.keypath}.searchResult.`)) {
          ractive.set(`${event.keypath}.searchResult.`, null)
        }
        return
      }

      // secondaryIndexType is used when searching for subject as suggestion from external source
      let indexType = preferredIndexType || secondaryIndexType

      const config = ractive.get('config')

      // We have two kinds of searches:
      //   A) Searching in a sorted list of authority labels
      //   B) Searching in Elasticsearch with a structured search query
      //
      // The following variables will be populated depending on which kind of search we do:
      let searchURI
      let searchBody
      let axiosMethod

      const fieldForSortedListQuery = config.search[ indexType ].sortedListQueryForField
      const alphabeticalList = config.search[ indexType ].alphabeticalList
      if (alphabeticalList || fieldForSortedListQuery) {
        // A) Searching in sorted list
        axiosMethod = axios.get
        searchURI = searchURI = `${config.resourceApiUri}search/${config.search[ indexType ].type}/sorted_list?prefix=${searchString}${fieldForSortedListQuery ? '&field=' + fieldForSortedListQuery : ''}&minSize=40`
      } else {
        // B) Searching in Elasticsearch
        indexType = config.search[ indexType ].type
        searchURI = `/search/${indexType}/_search`
        axiosMethod = axios.post

        // Determine if we are doing a mainEntry constrained search
        const inputkeyPath = grandParentOf(event.keypath)
        const filterArgInputRef = ractive.get(`${inputkeyPath}.widgetOptions.filter.inputRef`)
        let mainEntry
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
          const results = ensureJSON(response.data)
          results.hits.hits.forEach(function (hit) {
            const item = hit._source
            item.isChecked = false
            item.score = hit._score
          })
          const searchResultNav = processSearchResultNavigation(results, config, indexType, fieldForSortedListQuery || config.search[ indexType ].exactMatchCompareField, searchString)
          let items = searchResultNav.items
          const highestScoreIndex = searchResultNav.highestScoreIndex
          const exactMatchWasFound = searchResultNav.exactMatchWasFound
          ractive.set(`${event.keypath}.searchResult`, {
            items: items,
            origin: event.keypath,
            searchTerm: searchString,
            highestScoreIndex: exactMatchWasFound ? highestScoreIndex : config.search[ indexType ].scrollToMiddleOfResultSet ? highestScoreIndex - 1 : false
          })
          positionSupportPanels(undefined, tabIdFromKeypath(event.keypath))
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
      ractive.set('save_status', translate('statusWorking'))
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
          updateInputsForResource(ensureJSON(response.data), subject, {
            keepDocumentUrl: true, inputs: [ _.find(allInputs(), function (input) {
              return input.predicate.indexOf('recordId') !== -1
            }) ]
          })

          // keep the value in current.old - so we can do create delete triple patches later
          if (keypath) {
            var cur = ractive.get(`${keypath}.current`)
            if (cur) {
              ractive.set(`${keypath}.old.value`, cur.value || '')
              ractive.set(`${keypath}.old.lang`, cur.lang)
            }
          }
          ractive.set('save_status', translate('statusSaved'))
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
      ractive.set('currentTaskDescription', taskDescriptionKey)
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

  /**
   * Shows overlay with TURTLE data
   * @param uri
   */
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

  /**
   * Close the compare section (right column) of the compare resources tool
   * @param type
   */
    function closeCompare (type) {
      ractive.set('compare', null)
      ractive.set('duplicateSearchTerm', undefined)
      _.each(ractive.get(`applicationData.flattenedInputsForDomainType.${type}`), function (input) {
        delete input.compareValues
        _.chain(input.subInputs).compact().each(function (subInput) {
          delete subInput.input.compareValues
        })
      })
      ractive.update()
      setTaskDescription(`edit${type}`)
      updateBrowserLocationWithQueryParameter(`compare_with_${type}`, undefined)
      // hack to make things not look uncool
      $('.inner-content').addClass(`dummy_${_.uniqueId()}`)
      positionSupportPanels()
    }

    function inputHasAcceptedSuggestions (targetInput, inputIndex) {
      return (!targetInput.isSubInput || ((targetInput.parentInput.hasAcceptedSuggestions || [])[ inputIndex ]))
    }

    function inputCanReceiveAdditionalSuggestions (targetInput) {
      return targetInput.widgetOptions && targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom
    }

    function copyValues (targetInput, sourceInput) {
      targetInput.datatypes = sourceInput.datatypes
      if (targetInput.type === 'select-predefined-value') {
        sourceInput.values[ 0 ].current.value = _.union(sourceInput.values[ 0 ].current.value, targetInput.values[ 0 ].current.value)
      } else {
        _.each(sourceInput.values, function (sourceValue) {
          if (!_.some(targetInput.values, function (targetValue) {
              return targetValue.current.value === sourceValue.current.value
            })) {
            targetInput.values = targetInput.values || []
            if (targetInput.values.length === 1 && targetInput.values[ 0 ].current.value === '' || targetInput.values[ 0 ].current.value === null || targetInput.values[ 0 ].current.value === undefined) {
              targetInput.values[ 0 ] = deepClone(sourceValue)
              targetInput.values[ 0 ].copiedFromType = unPrefix(sourceInput.domain)
              targetInput.values[ 0 ].copiedFromLabel = sourceInput.label
            } else {
              if (targetInput.multiple) {
                targetInput.values.push(deepClone(sourceValue))
              }
            }
          }
        })
      }
    }

  /**
   * Fetches a resource (some triples) to be used as template for new resource
   * @param templateResourcePartsFrom list of inputIds to use as query parameters when asking for tenmplate
   * @param newResourceType
   * @param inputs Which inputs to update with new temnplate data.
   * @returns {Promise.<T>}
     */
    function fetchResourceTemplate (templateResourcePartsFrom, newResourceType, inputs) {
      if (templateResourcePartsFrom) {
        let templateUri = URI(`http://data.deichman.no/${newResourceType.type.toLowerCase()}/template`)
        let abortFetchTemplate
        _.each(templateResourcePartsFrom, function (templateIdentifierPart) {
          const input = inputFromInputId(templateIdentifierPart)
          const value = input.values[ 0 ].current.value
          if (!value) {
            abortFetchTemplate = true
          }
          templateUri.addQuery(input.predicate, value)
        })

        if (!abortFetchTemplate) {
          return fetchExistingResource(templateUri.toString(), {
            noOverwrite: true,
            source: 'template',
            keepDocumentUrl: true,
            inputs
          })
        }
      }
      return Promise.resolve()
    }

  /**
   * Main exported object
   */
    const Main = {
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
            personItem.lifeSpan += `(${personItem.birthYear}-`
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
        if (uri && uri.length > 0) {
          uri = _.flatten([ uri ])[ 0 ]
          if (!isBlankNodeUri(uri)) {
            return i18nLabelValue(_.find(ractive.get(`predefinedValues.${type}`), function (predefinedValue) {
              return predefinedValue[ '@id' ] === uri
            })[ 'label' ])
          }
        } else {
          return ''
        }
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

        const loadPartials = function (applicationData) {
          applicationData.partials = applicationData.partials || {}
          try {
            applicationData.partials[ 'input' ] = require('../../public/partials/input.html')
            applicationData.partials[ 'input-string' ] = require('../../public/partials/input-string.html')
            applicationData.partials[ 'input-boolean' ] = require('../../public/partials/input-boolean.html')
            applicationData.partials[ 'input-string-large' ] = require('../../public/partials/input-string-large.html')
            applicationData.partials[ 'input-lang-string' ] = require('../../public/partials/input-lang-string.html')
            applicationData.partials[ 'input-gYear' ] = require('../../public/partials/input-gYear.html')
            applicationData.partials[ 'input-duration' ] = require('../../public/partials/input-duration.html')
            applicationData.partials[ 'input-date-time' ] = require('../../public/partials/input-date-time.html')
            applicationData.partials[ 'input-integer' ] = require('../../public/partials/input-integer.html')
            applicationData.partials[ 'input-nonNegativeInteger' ] = require('../../public/partials/input-nonNegativeInteger.html')
            applicationData.partials[ 'searchable-with-result-in-side-panel' ] = require('../../public/partials/searchable-with-result-in-side-panel.html')
            applicationData.partials[ 'support-for-searchable-with-result-in-side-panel' ] = require('../../public/partials/support-for-searchable-with-result-in-side-panel.html')
            applicationData.partials[ 'support-for-select-predefined-value' ] = require('../../public/partials/support-for-select-predefined-value.html')
            applicationData.partials[ 'support-for-input-string' ] = require('../../public/partials/support-for-input-string.html')
            applicationData.partials[ 'support-for-searchable-for-value-suggestions' ] = require('../../public/partials/support-for-searchable-for-value-suggestions.html')
            applicationData.partials[ 'support-for-edit-authority' ] = require('../../public/partials/support-for-edit-authority.html')
            applicationData.partials[ 'searchable-authority-dropdown' ] = require('../../public/partials/searchable-authority-dropdown.html')
            applicationData.partials[ 'searchable-for-value-suggestions' ] = require('../../public/partials/searchable-for-value-suggestions.html')
            applicationData.partials[ 'suggested-values' ] = require('../../public/partials/suggested-values.html')
            applicationData.partials[ 'suggestor-for-searchable-with-result-in-side-panel' ] = require('../../public/partials/suggestor-for-searchable-with-result-in-side-panel.html')
            applicationData.partials[ 'suggestor-for-select-predefined-value' ] = require('../../public/partials/suggestor-for-select-predefined-value.html')
            applicationData.partials[ 'suggestor-for-input-string' ] = require('../../public/partials/suggestor-for-input-string.html')
            applicationData.partials[ 'suggestor-for-input-string-large' ] = require('../../public/partials/suggestor-for-input-string-large.html')
            applicationData.partials[ 'suggestor-for-input-gYear' ] = require('../../public/partials/suggestor-for-input-gYear.html')
            applicationData.partials[ 'suggestor-for-input-integer' ] = require('../../public/partials/suggestor-for-input-integer.html')
            applicationData.partials[ 'suggestor-for-input-nonNegativeInteger' ] = require('../../public/partials/suggestor-for-input-nonNegativeInteger.html')
            applicationData.partials[ 'suggestor-for-input-literal' ] = require('../../public/partials/suggestor-for-input-literal.html')
            applicationData.partials[ 'select-predefined-value' ] = require('../../public/partials/select-predefined-value.html')
            applicationData.partials[ 'inverse-one-to-many-relationship' ] = require('../../public/partials/inverse-one-to-many-relationship.html')
            applicationData.partials[ 'copy-publication-and-work' ] = require('../../public/partials/copy-publication-and-work.html')
            applicationData.partials[ 'work' ] = require('../../public/partials/work.html')
            applicationData.partials[ 'relations' ] = require('../../public/partials/relations.html')
            applicationData.partials[ 'publication' ] = require('../../public/partials/publication.html')
            applicationData.partials[ 'delete-publication-dialog' ] = require('../../public/partials/delete-publication-dialog.html')
            applicationData.partials[ 'copy-resource-dialog' ] = require('../../public/partials/copy-resource-dialog.html')
            applicationData.partials[ 'delete-work-dialog' ] = require('../../public/partials/delete-work-dialog.html')
            applicationData.partials[ 'delete-resource-dialog' ] = require('../../public/partials/delete-resource-dialog.html')
            applicationData.partials[ 'confirm-enable-special-input-dialog' ] = require('../../public/partials/confirm-enable-special-input-dialog.html')
            applicationData.partials[ 'alert-existing-resource-dialog' ] = require('../../public/partials/alert-existing-resource-dialog.html')
            applicationData.partials[ 'additional-suggestions-dialog' ] = require('../../public/partials/additional-suggestions-dialog.html')
            applicationData.partials[ 'merge-resources-dialog' ] = require('../../public/partials/merge-resources-dialog.html')
            applicationData.partials[ 'edit-resource-warning-dialog' ] = require('../../public/partials/edit-resource-warning-dialog.html')
            applicationData.partials[ 'accordion-header-for-collection' ] = require('../../public/partials/accordion-header-for-collection.html')
            applicationData.partials[ 'readonly-input' ] = require('../../public/partials/readonly-input.html')
            applicationData.partials[ 'readonly-input-string' ] = require('../../public/partials/readonly-input-string.html')
            applicationData.partials[ 'readonly-input-boolean' ] = require('../../public/partials/readonly-input-boolean.html')
            applicationData.partials[ 'readonly-input-string-large' ] = require('../../public/partials/readonly-input-string-large.html')
            applicationData.partials[ 'readonly-input-gYear' ] = require('../../public/partials/readonly-input-gYear.html')
            applicationData.partials[ 'readonly-input-duration' ] = require('../../public/partials/readonly-input-duration.html')
            applicationData.partials[ 'readonly-input-date-time' ] = require('../../public/partials/readonly-input-date-time.html')
            applicationData.partials[ 'readonly-input-integer' ] = require('../../public/partials/readonly-input-integer.html')
            applicationData.partials[ 'readonly-input-nonNegativeInteger' ] = require('../../public/partials/readonly-input-nonNegativeInteger.html')
            applicationData.partials[ 'readonly-select-predefined-value' ] = require('../../public/partials/readonly-select-predefined-value.html')
            applicationData.partials[ 'readonly-hidden-url-query-value' ] = require('../../public/partials/readonly-hidden-url-query-value.html')
            applicationData.partials[ 'readonly-searchable-with-result-in-side-panel' ] = require('../../public/partials/readonly-searchable-with-result-in-side-panel.html')
            applicationData.partials[ 'links' ] = require('../../public/partials/links.html')
            applicationData.partials[ 'conditional-input-type' ] = require('../../public/partials/conditional-input-type.html')
          } catch (err) {
            console.log(err)
          }
          return applicationData
        }

        const extractConfig = function (response) {
          return { config: ensureJSON(response.data) }
        }

        const initTranslations = function (applicationData) {
          applicationData.translations = translations
          const language = (URI.parseQuery(URI.parse(document.location.href).query).language || 'no')
          applicationData.partials = applicationData.partials || {}
          applicationData.partials = _.extend(applicationData.partials, translations[ language ])
          applicationData.language = language
          return applicationData
        }

        /**
         * Saves inputs in a compound input as new blank noe
         * @param event
         * @param applicationData
         * @param index
         * @param op
         * @returns {Promise.<TResult>|*}
         */
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
                  var valuesKeypath = `${subInputs}.${subInputIndex}.input.values.${index}.current.value.0`
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
          var mainSubject = ractive.get(`targetUri.${actualSubjectType}`)
          var deleteSubject = ractive.get(`targetUri.${deleteSubjectType}`)
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
                  : subInput.input.values[ index ] ? (subInput.input.values[ index ][ spec.useValue ] || {}).value : undefined
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
                updateInputsForResource(response.data, mainSubject, { inputs: _.pluck(input.subInputs, 'input') })
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
              if (input.subInputs) {
                _.each(input.subInputs, function (subInput) {
                  subInput.input.values[ index ].old = subInput.input.values[ index ].old || {}
                  subInput.input.values[ index ].old.value = deepClone(subInput.input.values[ index ].current.value)
                })
              } else {
                input.values[ index ].old.value = deepClone(input.values[ index ].current.value)
              }
              ractive.update()
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
          const acceptedSourcekeypath = $(selection.element.parentElement).attr('data-accepted-source-keypath')
          let sourceSpan = ''
          if (acceptedSourcekeypath) {
            var source = (ractive.get(`${acceptedSourcekeypath}.current.accepted`) || {})[ selection.id ]
            const uniqueId = _.uniqueId()
            sourceSpan = source ? `<span id="${uniqueId}" class='suggestion-source suggestion-source-${source}'/>` : ''
            const removeSuggestionSourceObserver = ractive.observe(`${acceptedSourcekeypath}.current.accepted`, function (newValue, oldValue, keypath) {
              if (_.keys(newValue).length === 0) {
                $(`#${uniqueId}`).remove()
                removeSuggestionSourceObserver.cancel()
              }
            }, { init: false })
          }
          return $(`<span>${selection.text}${sourceSpan}</span>`)
        }

        function inputLabelWithContext (input) {
          let inputLabel = (input.labelKey ? translate(input.labelKey) : input.label)
          return input.isSubInput ? (input.parentInput.labelKey ? translate(input.parentInput.labelKey) : input.parentInput.label) + ': ' + inputLabel : inputLabel
        }

        function tabIndexForNode (node) {
          let nodeInfo = Ractive.getNodeInfo(node)
          let tabSelectedKeypath = `inputGroups.${nodeInfo.index.groupIndex}.tabSelected`
          ractive.observe(tabSelectedKeypath, function (newValue) {
            setTimeout(function () {
              if (!$(node).is('select.select2-hidden-accessible')) {
                $(node).attr('tabindex', newValue ? '0' : '-1')
              }
              $(node).siblings().find('span ul li input').first().attr('tabindex', newValue ? '0' : '-1')
            })
          }, { init: true })
          setTimeout(function () {
            $(node).siblings().find('span ul li input').first().attr('tabindex', '0')
          })
        }

        /**
         * temprarily turn off all observers to speed up execution
         * @param doStuff
         */
        function whileUnobserved (doStuff) {
          _.invoke(ractive.get('observers'), 'cancel')
          doStuff()
          enableObservers()
        }

        const initRactive = function (applicationData) {
          // decorators
          var select2 = function (node, mode) {
            const lang = applicationData.translations[ applicationData.language ]
            const select2Messages = {
              inputTooLong: function (args) {
                const overChars = args.input.length - args.maximum
                return lang.inputTooLong.replace('{{overChars}}', overChars)
              },
              inputTooShort: function (args) {
                return lang.inputTooShort.replace('{{minimum}}', args.minimum).replace('{{s}}', args.minimum > 1 ? 's' : '')
              },
              loadingMore: function () {
                return lang.loadingMore
              },
              maximumSelected: function (args) {
                if (args.maximum === 1) {
                  return lang.maximumOneCanBeSelected
                } else {
                  return lang.maximumSelected.replace('{{maximum}}', args.maximum)
                }
              },
              noResults: function () {
                return lang.noResults
              },
              searching: function () {
                return lang.searching
              }
            }
            tabIndexForNode(node)
            if (mode.mode === 'singleSelect') {
              $(node).select2({
                maximumSelectionLength: 1,
                templateSelection: templateSelection,
                language: select2Messages
              })
            } else if (mode.mode === 'multiSelect') {
              $(node).select2({
                templateSelection: templateSelection,
                language: select2Messages
              })
            } else if (mode.mode === 'authoritySelectSingle') {
              const inputDef = ractive.get(grandParentOf(Ractive.getNodeInfo(node).keypath))
              if (_.isArray(inputDef.indexTypes) && inputDef.indexTypes.length > 1) {
                throw new Error('searchable-authority-dropdown supports only supports singe indexType')
              }
              const indexType = _.isArray(inputDef.indexTypes) ? inputDef.indexTypes[ 0 ] : inputDef.indexTypes
              const config = ractive.get('config')
              const fieldForSortedListQuery = config.search[ indexType ].sortedListQueryForField
              $(node).select2({
                maximumSelectionLength: 1,
                minimumInputLength: 1,
                language: select2Messages,
                ajax: {
                  url: `${config.resourceApiUri}search/${indexType}/sorted_list`,
                  dataType: 'json',
                  delay: 250,
                  id: function (item) {
                    return item._source.uri
                  },
                  data: function (params) {
                    return {
                      prefix: `${params.term}`, // search term
                      page: params.page
                    }
                  },
                  processResults: function (data, params) {
                    params.page = params.page || 1
                    data.hits.hits.forEach(function (hit) {
                      var item = hit._source
                      item.score = hit._score
                    })

                    const navigation = processSearchResultNavigation(data, config, indexType, fieldForSortedListQuery, params.term)
                    const select2Data = _.map(data.hits.hits, function (obj, index) {
                      obj.id = obj._source.uri
                      obj.text = _.compact(_.map(inputDef.indexDocumentFields, function (field) {
                        return obj._source[ field ]
                      })).join(' - ')
                      if (index === navigation.highestScoreIndex) {
                        obj.highestScorer = true
                      }
                      if (navigation.exactMatchWasFound) {
                        obj.exactMatch = true
                      }
                      return obj
                    })
                    if (select2Data.length > 0) {
                      select2Data[ select2Data.length - 1 ].last = true
                    }

                    return {
                      results: select2Data,
                      pagination: {
                        more: (params.page * 30) < data.total_count
                      }
                    }
                  },
                  cache: true
                },
                templateResult: function (data, option) {
                  const scrollScript = `<script>
                              var maxAttempts = 20
                              function tryScroll () {
                                  var target = document.main.$('#highest-score-item')
                                  if (target) {
                                    target.closest('ul').find('li').removeClass('select2-results__option--highlighted')
                                    target.parent().addClass('select2-results__option--highlighted')
                                    target.closest('ul').scrollTo(target, 500, {offset: -30})
                                  } else {
                                      if (maxAttempts-- > 0) {
                                          setTimeout(tryScroll, 500)
                                      }
                                  }
                              }
                              setTimeout(tryScroll)
                            </script>`

                  return $(`
                        <div ${data.highestScorer ? 'id=highest-score-item' : ''} ${data.exactMatch ? 'class=exactMatch' : ''} >
                          ${data.text}
                          ${data.last ? scrollScript : ''}
                        </div> `)
                },
                templateSelection: function (data) {
                  return data.text === '' ? ractive.get(`authorityLabels[${data.id}]`) : data.text
                }
              })
            } else {
              throw Error("Value for as-select2 must be 'singleSelect', 'multiselect' or 'authoritySelectSingle")
            }

            let enableChange = false
            let unsetting = false
            $(node).on('select2:selecting', function (event) {
              enableChange = true
            })
            $(node).on('select2:unselecting', function (event) {
              enableChange = true
              unsetting = true
            })
            var setting = false
            $(node).on('change', function (e) {
              if (enableChange && !setting) {
                setting = true
                enableChange = false
                var inputValue = Ractive.getNodeInfo(e.target)
                var keypath = inputValue.keypath
                if ($(e.target).val()) {
                  ractive.set(`${keypath}.current.value`, $(e.target).val() || [])
                } else if (unsetting) {
                  ractive.set(`${keypath}.current.value`, [])
                }
                var inputNode = ractive.get(grandParentOf(keypath))
                let target = ractive.get(grandParentOf(grandParentOf(keypath))).targetUri || ractive.get(`targetUri.${unPrefix(inputNode.domain)}`)
                if (target && !inputNode.isSubInput && shouldExecPatchImmediately(keypath)) {
                  let waiter = ractive.get('waitHandler').newWaitable(e.target)
                  Main.patchResourceFromValue(target, inputNode.predicate,
                    ractive.get(keypath), inputNode.datatypes[ 0 ], errors, keypath)
                  waiter.cancel()
                }
                setting = false
              }
              unsetting = false
            })

            let keypath = `${this.getNodeInfo(node).resolve()}.current.value`
            const observer = ractive.observe(keypath, function (newvalue, oldValue) {
              function valuesAsString (values) {
                return _(values || []).sort().reduce(function (memo, value) { return `${memo}|${value}` }, '')
              }

              if (!setting && (valuesAsString(newvalue) !== valuesAsString(oldValue))) {
                setting = true
                window.setTimeout(function () {
                  $(node).val(newvalue).trigger('change')
                  setting = false
                }, 0)
                setTimeout(positionSupportPanels, 500)
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
            ractive.set(`${inputKeyPath}.allowAddNewButton`, false)
            ractive.set(`${inputKeyPath}.addNewHandledBySelect2`, true)
            return {
              teardown: function () {}
            }
          }
          const clickOutsideSupportPanelDetector = function (node) {
            $(document).click(function (event) {
              if (!event.isDefaultPrevented()) {
                const rightDummyPanel = $('#right-dummy-panel')
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
                  clearSupportPanels({ keep: [ 'enableEditResource' ] })
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
            let handler
            if (formatter === 'isbn') {
              handler = function () {
                const origVal = $(node).val()
                const isbnPrefix = /isbn:/.test(origVal) ? 'isbn:' : ''
                let value = origVal.replace(/[^\dXx]*/g, '').replace(/^isbn:/, '') // ISBN.parse not 100% with hyphens
                let parsedIsbn = ISBN.parse(value)
                if (parsedIsbn) {
                  if (parsedIsbn.isIsbn10()) {
                    $(node).val(isbnPrefix + parsedIsbn.asIsbn10(true))
                  } else {
                    if (parsedIsbn.isIsbn13()) {
                      $(node).val(isbnPrefix + parsedIsbn.asIsbn13(true))
                    }
                  }
                  ractive.updateModel()
                }
              }
              $(node).on('input', handler)
            }
            return {
              teardown: function () {
                if (handler) {
                  $(node).off('input', handler)
                }
              }
            }
          }
          const searchFieldGuesser = function (node, input) {
            if (!$(node).attr('data-guess')) {
              input.cclCodes = _.map(input.searchForValueSuggestions.searchParameterSpecs, (p) => { return p.ccl }).join(', ')
              const keypath = Ractive.getNodeInfo(node).keypath
              let handler = function () {
                let value = $(node).val()
                let guessedParamSpec = _(input.searchForValueSuggestions.searchParameterSpecs).find((spec) => {
                  return value.startsWith(`${spec.ccl}:`)
                }) || _(input.searchForValueSuggestions.searchParameterSpecs).find((spec) => {
                  return RegExp(spec.pattern).test(value)
                })
                ractive.set(`${keypath}.supportable`, guessedParamSpec)
                ractive.push('searchParameterGuessSupportsToClose', `${keypath}.supportable`)
                positionSupportPanels()
              }
              $(node).on('input', handler)
              $(node).attr('data-guess', true)
            }
            return {
              teardown: function () {
              }
            }
          }
          const relations = function (node, uri) {
            const keypath = Ractive.getNodeInfo(node).keypath
            ractive.set(`${keypath}.relations`, null)
            let type = _.last(parentOf(grandParentOf(keypath)).split('.'))
            uri = uri || ractive.get(`targetUri.${type}`)
            axios.get(proxyToServices(`${uri}/relations`)).then(function (response) {
              ractive.set(`${keypath}.relations`, response.data)
              if (response.data.length === 1) {
                ractive.set(`${keypath}.relations.0.toggleRelations`, true)
              }
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
            let observer
            if (stats) {
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
                    context: { input: args.input }
                  }, 'customRange', ui.value - 1, stats.rangeLength)
                }
              })
              observer = ractive.observe(`${input.keypath}.subInputs.0.input.rangeStats`, function (stats, oldVal, keypath) {
                $node.slider('option', {
                  value: stats.start,
                  max: stats.numberOfObjects
                })
              }, { init: false })
            }
            return {
              teardown: function () {
                if (observer) {
                  observer.cancel()
                }
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
                leftField.css('margin-bottom', diff + Number((leftField.css('margin-bottom') || '0').replace('px', '')))
              }
              if (diff >= 0) {} else {
                rightField.css('margin-bottom', -diff + Number((rightField.css('margin-bottom') || '0').replace('px', '')))
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
                  valueHashes.push(_.chain(args.input.subInputs).pluck('input').pluck('values').pluck(i).pluck('current').pluck('value').value().reduce(function (memo, val) { return `${memo}|${val}` }))
                }
                let compareValueHash = _.chain(args.input.subInputs).pluck('input').pluck('compareValues').pluck(args.inputValueIndex).pluck('current').pluck('value').value().reduce(function (memo, val) { return `${memo}|${val}` })
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
              })
            })
            return {
              teardown: function () {}
            }
          }
          const dropZone = function (node, args) {
            const draggedClass = `draggable_${args.inputIndex}`
            $(node).droppable({
              activeClass: 'drop-target',
              accept: `.${draggedClass}`,
              drop: function (event, ui) {
                if (args.input.subInputs) {
                  const data = $(ui.draggable).data()
                  // calculate target value index
                  var highestValueIndex = -1
                  _.each(_.chain(args.input.subInputs).pluck('input').pluck('values').value(), function (value) {
                    _.each(value, function (value, index) {
                      if ((!Array.isArray(value.current.value) && value.current.value) || (Array.isArray(value.current.value) && value.current.value[ 0 ])) {
                        highestValueIndex = Math.max(highestValueIndex, index)
                      }
                    })
                  })
                  let newValueIndex = highestValueIndex + 1
                  _.chain(args.input.subInputs).pluck('input').each(function (input, inputIndex) {
                    input.values[ newValueIndex ] = deepClone(data.input.subInputs[ inputIndex ].input.compareValues[ data.valueIndex ])
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
          const setGlobalFlag = function (node, args) {
            const ractive = this
            _.chain(args).keys().each(function (key) {
              ractive.set(key, true)
            })
            return {
              teardown: function () {
                _.chain(args).keys().each(function (key) {
                  ractive.set(key, null)
                })
              }
            }
          }
          const esotericToggleGroup = function (node, input) {
            const uniqueId = (input.subInputs ? input.subInputs[ 0 ].input : input).values[ 0 ].uniqueId
            const inputRef = `support_panel_base_${uniqueId}`
            let group = [ inputRef ]
            _.find($(node).closest('.esoteric.input-panel').nextAll(), function (node) {
              const $node = $(node)
              group.push($node.find('.field').attr('data-support-panel-base-id'))
              return (!$node.hasClass('esoteric'))
            })
            _.each($(node).children(), function (li) {
              const $li = $(li)
              if (group.includes($li.attr('data-belongs-to-id-ref'))) {
                $li.addClass('visible')
              }
            })
            Main.repositionSupportPanelsHorizontally()
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

          const shouldExecPatchImmediately = function (keypath) {
            return ractive.get(`${(keypath.match(/(^.*enableEditResource).*$/) || [ undefined, { mode: undefined } ])[ 1 ]}.mode` === 'edit')
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
                  let showIt = (input.visible && checkShouldInclude(input) && !(typeof ractive.get(`targetUri.${input.showOnlyWhenEmpty}`) !== 'undefined'))
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
              save_status: '',
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
                  enabled &= typeof ractive.get(`targetUri.${disabledUnlessSpec.presentTargetUri}`) !== 'undefined'
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
                return tabSelected === true || (typeof ractive.get(`targetUri.${domainType}`) === 'string')
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
                var resourceLabel = Ontology.resourceLabel(applicationData.ontology, subject, ractive.get('applicationData.language'))
                return resourceLabel || ''
              },
              getExplanation: function (explanations, value) {
                return _.find(explanations.patterns, function (pattern) {
                  return RegExp(pattern.match).test(value)
                }).explanation
              },
              subjectTypeLabelDet: function (subjectType) {
                return translate(`${subjectType}LabelDet`)
              },
              resourceIsLoaded: function (type) {
                return typeof ractive.get(`targetUri.${type}`) !== 'undefined'
              },
              getSearchResultItemLabel: function (item, itemLabelProperties) {
                let searchResultItems = getDisplayProperties(itemLabelProperties, function (prop) {
                  return item[ prop ]
                })
                return _.compact(_.pluck(searchResultItems, 'val'))
                  .join(' ')
                  .replace('– ', '-')
                  .replace(/[,:]$/, '')
                  .replace(': ', ' : ')
              },
              genPublicationLink: function (item) {
                return item.workUri.replace(
                  new RegExp('^http:\\/\\/data\\.deichman\\.no\\/work\\/(w[a-f0-9]+)$'),
                  'http://sok.deichman.no/work/$1') +
                  item.uri.substr(23)
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
              checkShouldInclude,
              checkEsoteric,
              abbreviate: function (label) {
                return applicationData.config.abbreviations[ label ] || label
              },
              invert: function (label) {
                return applicationData.config.inverseLabels[ label ] || label
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
              },
              translate (msgKey) {
                return translate(msgKey)
              },
              typeFromUri
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
              dropZone,
              setGlobalFlag,
              esotericToggleGroup,
              searchFieldGuesser
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
                this.toggle(`${event.keypath}.expanded`)
              },
              toggleEsoteric: function (event) {
                if (eventShouldBeIgnored(event)) return
                this.toggle(`${event.keypath}.showEsoteric`).then(positionSupportPanels.bind(undefined, event.keypath))
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
                ractive.set(`${event.keypath}.allowAddNewButton`, false)
                ractive.set(`${mainInput.keypath}.unFinished`, false)
                positionSupportPanels(undefined, tabIdFromKeypath(event.keypath))
                copyAdditionalSuggestionsForGroup(Number(event.keypath.split('.')[ 1 ]))
                ractive.update().then(function () {
                  heightAligned(document.main.$(event.node).closest('.height-aligned'))
                })
              },
              // patchResource creates a patch request based on previous and current value of
              // input field, and sends this to the backend.
              patchResource: function (event, predicate, rdfType, editAuthorityMode) {
                const inputValue = event.context
                const eventKeypath = event.keypath
                const input = event.input || ractive.get(grandParentOf(eventKeypath))
                const proceed = function () {
                  const subject = input.belongsToForm ? input.belongsToForm.targetUri : ractive.get(`targetUri.${rdfType}`)
                  if (subject) {
                    delete inputValue.copiedFromType
                    delete inputValue.copiedFromLabelKey
                    let waiter = ractive.get('waitHandler').newWaitable(event.original.target)
                    Main.patchResourceFromValue(subject, predicate, inputValue, input.datatypes[ 0 ], errors, event.keypath)
                    event.context.domain = rdfType
                    if (input.multiple && input.type !== 'select-predefined-value') {
                      input.allowAddNewButton = true
                    }
                    waiter.cancel()
                  }
                  ractive.update()
                }
                const revert = function () {
                  ractive.set(`${event.keypath}.current.value`, event.context.old.value)
                }

                if (!input.isSubInput && (!eventKeypath || shouldExecPatchImmediately(eventKeypath))) {
                  if (inputValue.error || (inputValue.current.value === '' && inputValue.old.value === '') || inputValue.current.value === inputValue.old.value) {
                    return
                  }
                  if (editAuthorityMode && /^.*(name|prefLabel|mainTitle)$/.test(predicate)) {
                    warnEditResourceName({
                      fieldLabel: ractive.get(grandParentOf(eventKeypath)).label.toLowerCase(),
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
                ractive.update().then(setTimeout(positionSupportPanels))
              },
              searchResource: function (event, searchString, preferredIndexType, secondaryIndexType, options) {
                options = options || {}
                if (options.skipIfAdvancedQuery && esquery.isAdvancedQuery(searchString) && !ractive.get('config.search')[ preferredIndexType || secondaryIndexType ].alphabeticalList) {
                  return
                }
                debouncedSearch(event, searchString, preferredIndexType, secondaryIndexType, options)
              },
              searchResourceFromSuggestion: function (event, searchString, indexType) {
                if (eventShouldBeIgnored(event)) return
                ractive.fire('searchResource', { keypath: `${grandParentOf(event.keypath)}.values.0` }, searchString, indexType)
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
                updateBrowserLocationClearAllExcept([ 'openTab', 'language' ])
                updateBrowserLocationWithUri(typeFromUri(uri), uri)
                forAllGroupInputs(function (input) {
                  if (input.hiddenUrlQueryValue &&
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
              },
              focusEditItem: function (event, itemIndex) {
                $(`#ed-item-${itemIndex}`).focus()
              },
              focusSelectItem: function (event, itemIndex) {
                $(`#sel-item-${itemIndex}`).focus()
              },
              focusNextItem: function (event, type) {
                let nextItemId = $(event.node).attr(`data-next-${type}-item`)
                $(`#${nextItemId}`).focus()
              },
              focusPrevItem: function (event, type) {
                let prevItemId = $(event.node).attr(`data-prev-${type}-item`)
                $(`#${prevItemId}`).focus()
              },
              focusNextSubItem: function (event) {
                let nextSubItemId = $(event.node).attr('data-next-sub-item')
                $(`#${nextSubItemId}`).focus()
              },
              xfocusPrevSubItem: function (event) {
                let nextSubItemId = $(event.node).attr('data-prev-sub-item')
                $(`#${nextSubItemId}`).focus()
              },
              focusPrevSubItem: function (event, itemIndex, subItemIndex) {
                if (subItemIndex > 0) {
                  let prevSubItemId = $(event.node).attr('data-prev-sub-item')
                  $(`#${prevSubItemId}`).focus()
                } else {
                  $(`#item-${itemIndex}-details-toggle`).focus()
                }
              },
              focusDetailsToggle: function (event, itemIndex) {
                $(event.node).blur()
                $(`#item-${itemIndex}-details-toggle`).focus()
              },
              focusItem: function (event, itemIndex, actions) {
                actions = actions || [ 'sel' ]
                $(event.node).blur()
                for (var i = 0; i < actions.length; i++) {
                  if ($(`#${actions[ i ]}-item-${itemIndex}`).focus().length > 0) {
                    break
                  }
                }
              },
              toggleSubItem: function (event) {
                ractive.toggle(`${event.keypath}.toggleSubItem`)
              },
              toggleRelations: function (event) {
                ractive.toggle(`${event.keypath}.toggleRelations`)
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
              selectSearchableItem: function (event, uri, origin, displayValue, options) {
                ractive.set('currentSearchResultKeypath', grandParentOf(event.keypath))
                options = options || {}
                if (options.loadResourceForCompare) {
                  var queryArg = {}
                  const type = typeFromUri(uri)
                  queryArg[ `compare_with_${type}` ] = uri
                  loadOtherResource(queryArg)
                  setTaskDescription(`compare${type}`)
                  ractive.set(grandParentOf(event.keypath), undefined)
                  return
                }
                if (options.action === 'edit') {
                  ractive.set(`${origin}.searchResultHidden`, ractive.get(`${origin}.searchResult`))
                }
                ractive.set(`${origin}.searchResult`, null)
                const inputKeyPath = grandParentOf(origin)
                const input = ractive.get(inputKeyPath)
                const editWithTemplateSpec = ractive.get(`${inputKeyPath}.widgetOptions.editWithTemplate`)
                if (options.action === 'edit' && editWithTemplateSpec) {
                  ractive.fire('editResource', null, editWithTemplateSpec, uri)
                } else if (options.action === 'edit' && ractive.get(`${inputKeyPath}.widgetOptions.enableInPlaceEditing`)) {
                  const indexType = ractive.get(`${inputKeyPath}.selectedIndexType`)
                  const form = ractive.get(`${inputKeyPath}.widgetOptions.enableEditResource.forms.${indexType}`)
                  const inputs = form.inputs
                  _.each(inputs, function (input) {
                    input.values = emptyValues(false, true)
                  })
                  ractive.update()
                  fetchExistingResource(uri, { inputs, overrideMainEntry: true, keepDocumentUrl: true })
                  ractive.set(`${inputKeyPath}.widgetOptions.enableEditResource.showInputs`, Number.parseInt(_.last(origin.split('.'))))
                  ractive.set(`${inputKeyPath}.widgetOptions.enableEditResource.mode`, 'edit')
                  form.targetUri = uri
                } else if (input.isMainEntry || options.subItem) {
                  fetchExistingResource(uri, { demoteAcceptedSuggestions: true })
                    .then(function () {
                      updateInputsForDependentResources(typeFromUri(uri), uri)
                    }).then(function () {
                    setTimeout(positionSupportPanels, 1000)
                  })
                } else {
                  ractive.set(`${origin}.old.value`, ractive.get(`${origin}.current.value`))
                  ractive.set(`${origin}.current.value`, uri)
                  ractive.set(`${origin}.current.displayValue`, displayValue)
                  ractive.set(`${origin}.deletable`, true)
                  ractive.set(`${origin}.searchable`, false)
                  _.each(input.dependentResourceTypes, function (resourceType) {
                    unloadResourceForDomain(resourceType)
                  })
                  if (!input.isSubInput && ractive.get(`targetUri.${unPrefix(input.domain)}`)) {
                    let originTarget = $(`span[data-support-panel-base-id=support_panel_base_${ractive.get(origin).uniqueId}] span a.support-panel-expander`)
                    ractive.fire('patchResource',
                      { keypath: origin, context: ractive.get(origin), original: { target: originTarget } },
                      ractive.get(grandParentOf(origin)).predicate,
                      unPrefix(input.domain))
                  }
                  ractive.set(`${origin}.searchResult`, null)
                }
                event.original.preventDefault()
              },
              clearSupportPanels: function () {
                clearSupportPanels()
              },
              unselectEntity: function (event) {
                const closest = $(event.node).closest('span[data-support-panel-base-id^=support_panel_base_]')
                ractive.set(`${event.keypath}.searchResult`, null)
                ractive.set(`${event.keypath}.current.value`, '')
                ractive.set(`${event.keypath}.current.displayValue`, '')
                ractive.set(`${event.keypath}.deletable`, false)
                ractive.set(`${event.keypath}.searchable`, true)
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
                  var keyPath = `inputGroups.${groupIndex}`
                  ractive
                    .set(`${keyPath}.tabSelected`, keyPath === event.keypath)
                    .then(positionSupportPanels)
                })
              },
              nextStep: function (event) {
                if (event.context.restart) {
                  Main.restart()
                }
                let waitHandler = ractive.get('waitHandler')
                waitHandler.newWaitable(event.original.target)
                const newResourceType = event.context.createNewResource
                if (newResourceType && (!ractive.get(`targetUri.${newResourceType.type}`))) {
                  fetchResourceTemplate(newResourceType.templateResourcePartsFrom, newResourceType)
                    .then(function () {
                      if (!ractive.get('primarySuggestionAccepted')) {
                        _.each(_.keys(newResourceType.copyInputValues), function (copyFromInputId) {
                          const sourceInput = inputFromInputId(copyFromInputId)
                          if (sourceInput) {
                            const targetInput = inputFromInputId(newResourceType.copyInputValues[ copyFromInputId ])
                            if (targetInput) {
                              copyValues(targetInput, sourceInput)
                            } else {
                              throw Error(`Unknown input id ${newResourceType.copyInputValues[ copyFromInputId ]} in target source input in copyInputValues spec`)
                            }
                          } else {
                            throw Error(`Unknown input id ${newResourceType.copyInputValues[ copyFromInputId ]} in input source input in copyInputValues spec`)
                          }
                        })
                      }
                      saveNewResourceFromInputs(newResourceType.type)
                      ractive.update()
                    })
                }
                var foundSelectedTab = false
                _.each(ractive.get('inputGroups'), function (group, groupIndex) {
                  var keyPath = `inputGroups.${groupIndex}`
                  if (foundSelectedTab) {
                    ractive.set(`${keyPath}.tabSelected`, true)
                    foundSelectedTab = false
                  } else {
                    if (ractive.get(`${keyPath}.tabSelected`)) {
                      foundSelectedTab = true
                    }
                    ractive.set(`${keyPath}.tabSelected`, false)
                  }
                })
                positionSupportPanels()
                setTimeout(positionSupportPanels)
                $('body').scrollTo(0, 100)
              },
              deleteResource: function (event) {
                var uriToDelete = event.context.targetUri || ractive.get(`targetUri.${event.context.rdfType}`)
                deleteResource(uriToDelete, event.context, function () {
                  unloadResourceForDomain(event.context.rdfType)
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
                      ractive.fire('activateTab', { keypath: `inputGroups.${event.context.afterSuccess.gotoTab}` })
                    }
                  }
                })
              },
              showCreateNewResource: function (event, origin) {
                if (eventShouldBeIgnored(event)) return
                if (!event.context.prefillFromAcceptedSource) {
                  _.each(event.context.inputs, function (input, index) {
                    ractive.set(`${event.keypath}.inputs.${index}.values`, emptyValues(false, true))
                  })
                }
                ractive.set(`${origin}.searchResult.hidden`, true)
                ractive.set(`${grandParentOf(event.keypath)}.showInputs`, event.index.inputValueIndex || 0)
                let suggestedValuesGraphNode = ractive.get(`${grandParentOf(grandParentOf(event.keypath))}.suggestedValuesForNewResource.${event.index.inputValueIndex}`)
                if (suggestedValuesGraphNode) {
                  updateInputsForResource({}, null, {
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
                const inputs = event.context.inputs
                let displayValueInput = _.find(inputs, function (input) {
                  return input.displayValueSource === true
                })
                const eventKeypath = event.keypath
                let searchOriginInput = ractive.get(grandParentOf(eventKeypath))
                let useAfterCreation = searchOriginInput.useAfterCreation
                let targetInput = ractive.get(grandParentOf(origin))

                let setCreatedResourceUriInSearchInput = function (resourceUri) {
                  if (!maintenance) {
                    ractive.set(`${origin}.current.value`, resourceUri)
                    if (displayValueInput) {
                      ractive.set(`${origin}.current.displayValue`, displayValueInput.values[ 0 ].current.value)
                    }
                    ractive.set(`${origin}.deletable`, true)
                    ractive.set(`${origin}.searchable`, false)
                    ractive.set(`${eventKeypath}.visible`, null)
                  } else {
                    ractive.set(`${origin}.current.value`, null)
                    if (displayValueInput) {
                      ractive.set(`${origin}.current.displayValue`, null)
                    }
                  }
                  ractive.set(`${grandParentOf(eventKeypath)}.showInputs`, null)
                  return resourceUri
                }
                let patchMotherResource = function (resourceUri) {
                  if (!useAfterCreation && !targetInput.isSubInput && !targetInput.searchMainResource) {
                    Main.patchResourceFromValue(ractive.get(`targetUri.${targetInput.rdfType}`), targetInput.predicate, ractive.get(origin), targetInput.datatypes[ 0 ], errors)
                    ractive.set(`${origin}.old.value`, resourceUri)
                  }
                  return resourceUri
                }

                function setCreatedResourceValuesInMainInputs () {
                  let groupInputs = ractive.get('inputGroups')
                  _.each(inputs, function (input) {
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
                    const type = typeFromUri(resourceUri)
                    ractive.set(`targetUri.${type}`, resourceUri)
                    updateInputsForDependentResources(type, resourceUri)
                    ractive.update()
                    updateBrowserLocationWithUri(type, resourceUri)
                  }
                  return resourceUri
                }
                let clearInputsAndSearchResult = function () {
                  if (ractive.get(`${origin}.searchResult`)) {
                    ractive.set(`${origin}.searchResult`, null)
                  }
                  _.each(inputs, function (input, index) {
                    ractive.set(`${eventKeypath}.inputs.${index}.values`, emptyValues(false, true))
                  })
                  ractive.set(`${eventKeypath}.showInputs`, false)
                  ractive.set(`${grandParentOf(origin)}.allowAddNewButton`, true)
                }
                let nop = function (uri) {
                  return uri
                }
                let originTarget = $(`span[data-support-panel-base-id=support_panel_base_${ractive.get(origin).uniqueId}] span a.support-panel-expander`)
                let wait = ractive.get('waitHandler').newWaitable(originTarget)
                const domainType = event.context.rdfType
                if (useAfterCreation) {
                  if (!targetInput.searchMainResource) {
                    unloadResourceForDomain(domainType, useAfterCreation.excludeInputRefs)
                  }
                  setCreatedResourceValuesInMainInputs()
                }
                const inputsToSave = (!maintenance && targetInput.searchMainResource) ? allTopLevelGroupInputsForDomain(domainType) : inputs
                fetchResourceTemplate(event.context.templateResourcePartsFrom, { type: event.context.rdfType }, inputsToSave)
                  .then(function () {
                    saveInputs(inputsToSave, domainType)
                      .then(setCreatedResourceUriInSearchInput)
                      .then(!maintenance ? patchMotherResource : nop)
                      .then(!maintenance ? setTargetUri : nop)
                      .then(clearInputsAndSearchResult)
                      .then(wait.cancel)
                      .then(function () {
                        setTimeout(positionSupportPanels)
                      })
                  })
              },
              cancelEdit: function (event, origin) {
                $(event.node).closest('.panel-part').find('span[contenteditable=true]').focus()
                clearSupportPanels()
                ractive.set(`${grandParentOf(event.keypath)}.showInputs`, null)
                ractive.set(`${grandParentOf(event.keypath)}.mode`, null)
                ractive.set(`${event.keypath}.targetUri`, null)
                const hiddenSearchResult = ractive.get(`${origin}.searchResultHidden`)
                if (hiddenSearchResult) {
                  ractive.set(`${origin}.searchResult`, hiddenSearchResult)
                  ractive.set(`${origin}.searchResultHidden`, undefined)
                  event.original.preventDefault()
                }
              },
              fetchValueSuggestions: function (event) {
                ractive.get('waitHandler').newWaitable(event.original.target)
                var searchValue = event.context.current.value
                let parameterName

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
                    promises.push(axios.get(`/valueSuggestions/${source}?${parameterName}=${encodeURIComponent(searchValue.replace(',', ''))}`, {
                        headers: {
                          Accept: 'application/ld+json'
                        }
                      }
                    ).then(function (response) {
                      var fromPreferredSource = response.data.source === (ractive.get('applicationData.preferredSource') || searchExternalSourceInput.searchForValueSuggestions.preferredSource.id)
                      var hitsFromPreferredSource = {
                        source: response.data.source,
                        items: [],
                        totalHits: response.data.totalHits
                      }
                      _.each(response.data.hits, function (hit) {
                        var graph = ldGraph.parse(hit)
                        if (fromPreferredSource) {
                          hitsFromPreferredSource.items.push(externalSourceHitDescription(graph, response.data.source, searchExternalSourceInput.searchForValueSuggestions.preferredSource.name))
                          resultStat.itemsFromPreferredSource++
                        } else {
                          var options = {
                            keepDocumentUrl: true,
                            onlyValueSuggestions: true,
                            source: response.data.source
                          }
                          _.each([ 'Work', 'Publication' ], function (domain) {
                            let byType = graph.byType(domain)
                            updateInputsForResource({}, null, options, byType[ 0 ], domain)
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
                  const searchParameterSpec = _(searchExternalSourceInput.searchForValueSuggestions.searchParameterSpecs).find((spec) => {
                    return searchValue.startsWith(`${spec.ccl}:`)
                  }) || _(searchExternalSourceInput.searchForValueSuggestions.searchParameterSpecs).find((spec) => {
                    return RegExp(spec.pattern).test(searchValue)
                  })
                  parameterName = searchParameterSpec
                    ? searchParameterSpec.parameter
                    : searchExternalSourceInput.searchForValueSuggestions.parameterName || event.context.supportable.checkExistingResource.queryParameter
                  searchValue = searchParameterSpec
                    ? (searchValue.match(searchParameterSpec.pattern) || [])[ searchParameterSpec.groupNumber ]
                    : searchValue
                  if (searchExternalSourceInput.searchForValueSuggestions.pattern && !(new RegExp(searchExternalSourceInput.searchForValueSuggestions.pattern).test(searchValue))) {
                    return
                  }
                  const checkExistingResource = searchExternalSourceInput.searchForValueSuggestions.checkExistingResource || (event.context.supportable ? event.context.supportable.checkExistingResource : searchParameterSpec.checkExistingResource)
                  if (checkExistingResource) {
                    ractive.fire('checkExistingResource', searchValue, checkExistingResource, doExternalSearch.bind(null, parameterName, searchValue), parameterName)
                  } else {
                    doExternalSearch(parameterName, searchValue)
                  }
                }
              },
              checkExistingResource: function (queryValue, spec, proceed, parameterName) {
                let searchUrl = ''
                if (spec.queryParameter === 'hasEan') { // TODO : hasEAN should probably have separate route
                  searchUrl = proxyToServices(`${spec.url}?${spec.queryParameter}=${queryValue}${_.reduce(spec.showDetails, function (memo, fieldName) {
                    return memo + '&@return=' + fieldName.replace(/[^a-zA-Z_]/g, '')
                  }, '')}`)
                } else {
                  searchUrl = proxyToServices(`${spec.url}/${queryValue}`)
                }
                axios.get(searchUrl, { headers: { 'x-apicache-bypass': true } }).then(function (response) {
                  let parsed = ldGraph.parse(response.data)
                  let existingResources = parsed.byType(spec.type)
                  if (existingResources.length > 0) {
                    alertAboutExistingResource(spec, _.map(existingResources, function (resource) {
                      const displayProperties = _.map(getDisplayProperties(spec.showDetails, valuePropertyFromNode(resource), indexTypeFromNode(resource)), (prop) => prop.val)
                      const details = displayProperties.join(' ')
                        .replace(/[,\.:]\s*$/g, '')
                        .replace(/- /, '-')
                        .replace(/-(?=[^0-9])/, '- ')
                        .replace(/: /g, ' : ')
                        .replace(/ {2}/g, ' ')
                      return { uri: resource.id, details }
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
                  setMultiValues([ { id: value.value } ], input, 0, { source: source, intitalLoad: true })
                } else {
                  var values = _.map(input.values[ 0 ].current.value, function (value) {
                    return { id: value }
                  })
                  values.push({ id: value.value, source })
                  setMultiValues(values, input, 0, { intitalLoad: true })
                }
                const selectField = $(`span[data-support-panel-base-id="support_panel_base_${input.values[ 0 ].uniqueId}"] span.select2.select2-container`)
                ractive.fire('patchResource', {
                    original: { target: selectField },
                    keypath: `${grandParentOf(event.keypath)}.values.0`,
                    context: input.values[ 0 ]
                  },
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
                const selectField = $(`span[data-support-panel-base-id="support_panel_base_${input.values[ input.multiple ? oldValues.length - 1 : 0 ].uniqueId}"] input`)
                ractive.fire('patchResource',
                  {
                    keypath: `${grandParentOf(event.keypath)}.values.${valueIndex}`,
                    context: input.values[ valueIndex ],
                    original: { target: selectField }
                  },
                  input.predicate,
                  unPrefix(input.domain))
              },
              acceptExternalItem: function (event) {
                ractive.set('primarySuggestionAccepted', true)
                _.each(ractive.get('searchParameterGuessSupportsToClose'), function (keypath) {
                  ractive.set(keypath, null)
                })
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
                          updateInputsForResource({}, null, {
                            keepDocumentUrl: true,
                            source: event.context.source,
                            sourceLabel: event.context.sourceLabel,
                            wrapperObject: wrapperObject,
                            wrappedIn: wrappedIn,
                            deferUpdate: true,
                            disablePagination: true
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
                  ractive.update().then(function () {
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
                            let suggestedValue = valueOfInputById(targetInput.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.inputRef, 0)
                            if (suggestedValue && !(suggestedValue === '' || _.isEqual(suggestedValue, []))) {
                              value.additionalSuggestion = {
                                value: suggestedValue,
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
                    ractive.update()
                  }).then(function () {
                    ractive.splice(parentOf(grandParentOf(event.keypath)))
                  }).then(waiter.done)
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
                showTurtle(`${proxyToServices(resourceUri)}?format=TURTLE`)
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
                            const inputRef = event.context.showFieldsOfRelated.filter(item => item.field === property)[ 0 ].inputRef
                            if (inputRef) {
                              const input = ractive.get('applicationData.inputMap')[ `${typeFromUri(parentUri)}.http://data.deichman.no/ontology#${property}` ]
                              const oldValue = valueOfInputByInputId(inputRef) || ''
                              const newValue = relation.projections[ property ]
                              if (newValue) {
                                promises.push(patchValue(response.headers.location, property, typesFromRange(input.ranges[ 0 ]).rdfType, oldValue, newValue))
                              }
                            }
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
                      ractive.set(`${numberingInput.keypath}.values.${_.last(event.keypath.split('.'))}.current.value`, `${nextNumber}${lines > 1 ? '-' : ''}${lines > 1 ? (nextNumber + lines - 1) : ''}`)
                    }
                  })
                }
                positionSupportPanels(undefined, tabIdFromKeypath(event.keypath))
              },
              copyPublicationAndWork: function (event, oldWorkUri, oldPublicationUri) {
                const headers = {
                  headers: {
                    Accept: 'application/ld+json',
                    'Content-Type': 'application/ld+json'
                  }
                }
                let clonedPublicationUri
                copyPublication(event.context, function () {
                  ractive.set('copyPublicationProgress', 'progressCopyingPublication')
                  return axios.post(proxyToServices(`${oldPublicationUri}/clone`), {}, headers)
                    .then(function (response) {
                      ractive.set('copyPublicationProgress', 'progressCopyingWork')
                      clonedPublicationUri = response.headers.location
                      return axios.post(proxyToServices(`${oldWorkUri}/clone`), {}, headers)
                    })
                    .then(function (response) {
                      ractive.set('copyPublicationProgress', 'progressConnectingPubToWork')
                      const clonedWorkUri = response.headers.location
                      return axios.patch(proxyToServices(clonedPublicationUri), [
                        {
                          op: 'del',
                          s: clonedPublicationUri,
                          p: 'http://data.deichman.no/ontology#publicationOf',
                          o: {
                            value: oldWorkUri,
                            type: 'http://www.w3.org/2001/XMLSchema#anyURI'
                          }
                        },
                        {
                          op: 'add',
                          s: clonedPublicationUri,
                          p: 'http://data.deichman.no/ontology#publicationOf',
                          o: {
                            value: clonedWorkUri,
                            type: 'http://www.w3.org/2001/XMLSchema#anyURI'
                          }
                        }
                      ], {
                        headers: {
                          Accept: 'application/ld+json',
                          'Content-Type': 'application/ldpatch+json'
                        }
                      })
                    }).then(function () {
                      ractive.set('clonedPublicationUri', clonedPublicationUri)
                      return ractive
                        .set('copyPublicationProgress', 'progressCopyingDone')
                    }).catch(function (message) {
                      return ractive
                        .set('error', {
                          message
                        })
                    })
                }, function () {
                  if (!ractive.get('error')) {
                    updateBrowserLocationWithUri('Publication', clonedPublicationUri)
                    Main.init()
                  }
                })
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
            const vetoesKeyPath = `${inputGroupKeypath}.inputGroupRequiredVetoes.${valueIndex}`
            let inputGroupRequiredVetoes = (ractive.get(vetoesKeyPath) || '').split('')
            if (veto) {
              inputGroupRequiredVetoes = _.union(inputGroupRequiredVetoes, [ voter ])
            } else {
              inputGroupRequiredVetoes = _.difference(inputGroupRequiredVetoes, [ voter ])
            }
            ractive.set(vetoesKeyPath, inputGroupRequiredVetoes.join(''))
          }

          function checkRequiredSubjectTypeSelection (keypath, newValue) {
            const valueIndex = _.last(parentOf(keypath).split('.'))
            const inputKeypath = parentOf(grandParentOf(keypath))
            const inputGroupKeypath = parentOf(grandParentOf(inputKeypath))
            const input = ractive.get(inputKeypath)
            if (input.required && _.isArray(input.subjectTypes) && input.subjectTypes.length < 2) {
              const veto = newValue === undefined || newValue === null
              castVetoForRequiredSubInput(inputGroupKeypath, valueIndex, '*', veto)
            }
          }

          function checkRequiredSubInput (newValue, keypath) {
            newValue = _.flatten([ newValue ]).join('')
            const valueIndex = _.last(grandParentOf(keypath).split('.'))
            const inputKeypath = grandParentOf(grandParentOf(keypath))
            const inputGroupKeypath = parentOf(grandParentOf(inputKeypath))
            const input = ractive.get(inputKeypath)
            if (input.required) {
              const voter = _.last(parentOf(grandParentOf(grandParentOf(keypath))).split('.'))
              const veto = !(typeof newValue === 'string' && newValue.length > 0) ||
                (input.type === 'searchable-with-result-in-side-panel' && typeof newValue === 'string' && isBlankNodeUri(newValue))
              castVetoForRequiredSubInput(inputGroupKeypath, valueIndex, voter, veto)
            }
          }

          ractive.set('observers', [
            ractive.observe(`${inputsKeypath}.*.subInputs.0.input.values.*.subjectType`, function (newValue, oldValue, keypath) {
              checkRequiredSubjectTypeSelection(keypath, newValue)
              ractive.set(`${parentOf(keypath)}.oldSubjectType`, oldValue)
            }, { init: false }),

            ractive.observe(`${inputsKeypath}.*.subInputs.*.input.values.*.current.value`, function (newValue, oldValue, keypath) {
              checkRequiredSubInput(newValue, keypath)
            }, { init: true }),

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
                  const inputKeypath = grandParentOf(grandParentOf(keypath))
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
                  ractive.set(`${keypath}.error`, false)
                  return
                }
                const parent = grandParentOf(keypath)
                let valid = false
                try {
                  valid = Ontology.validateLiteral(newValue.current.value, ractive.get(parent).range)
                } catch (e) {
                  console.log(e)
                  return
                }
                if (valid) {
                  ractive.set(`${keypath}.error`, false)
                } else {
                  ractive.set(`${keypath}.error`, 'ugyldig input')
                }
              }
            }, { init: false }),

            ractive.observe('inputGroups.*.tabSelected', function (newValue, oldValue, keypath) {
              const groupIndex = keypath.split('.')[ 1 ]
              if (newValue === true) {
                updateBrowserLocationWithTab(groupIndex)
                const additionalSuggestionsForGroup = ractive.get(`inputGroups.${groupIndex}.additionalSuggestions`)
                if (additionalSuggestionsForGroup) {
                  setTimeout(function () {
                    alertAboutAdditionalSuggestions(additionalSuggestionsForGroup, function (allowPartialSuggestions) {
                      forAllGroupInputs(function (input, groupIndex1) {
                        if (groupIndex1 === Number(groupIndex)) {
                          _.each(input.values, function (value, valueIndex) {
                            if ((allowPartialSuggestions || !additionalSuggestionsForGroup.incompleteSuggestions[ valueIndex ]) && value.additionalSuggestion &&
                              (value && (!value.current || value.current.value === undefined || value.current.value === null || value.current.value === '' || _.isEqual(value.current.value, [ '' ]) ||
                                (input.type === 'searchable-with-result-in-side-panel' && typeof value.current.displayValue !== 'string' || value.current.displayValue === '')))) {
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
              let openInputForms = ractive.get('openInputForms') || []
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
              const sourceInput = inputFromInputId(input.widgetOptions.whenEmptyExternalSuggestionCopyValueFrom.inputRef)
              if (sourceInput) {
                const value = _.last(input.values)
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

        const loadOntology = function (applicationData) {
          return axios.get(applicationData.config.ontologyUri)
            .then(function (response) {
              applicationData.ontology = ensureJSON(response.data)
              return applicationData
            })
        }

        function initSelect2 (applicationData) {
          require('select2')
          return applicationData
        }

        function loadWorkOfPublication (options) {
          withPublicationOfWorkInput(function (publicationOfInput) {
            const workUri = _.flatten([ publicationOfInput.values[ 0 ].current.value ])[ 0 ]
            if (workUri) {
              return fetchExistingResource(workUri, options).then(function () {
                ractive.set('targetUri.Work', workUri)
              })
            }
          })
        }

        const setDisplayMode = function (applicationData) {
          const query = URI.parseQuery(URI.parse(document.location.href).query)
          if (query.hideHome) {
            $('#home').remove()
          }
          return applicationData
        }

        function initLanguages (applicationData) {
          $('#close-preview-button').text(applicationData.partials.close)
          $('#home').attr('href', `/?language=${applicationData.language || 'no'}`)
          $('html').attr('lang', applicationData.language || 'no')
          return applicationData
        }

        function showGrowler (applicationData) {
          applicationData = applicationData || ractive.get('applicationData') || {}
          const query = URI.parseQuery(URI.parse(document.location.href).query)
          $('#growlerMessage').text(applicationData.partials.pleaseWait)
          if (!query.noStartGrowl) {
            $('#growler').show()
          } else {
            $('#growler').hide()
          }
          const growlerSpinner = new Spinner({ scale: 2.0 }).spin()
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

        const initWaitHandler = function (applicationData) {
          ractive.set('waitHandler', {
            waiters: [],
            newWaitable: function (waitingClassTarget) {
              const target = $(waitingClassTarget)
              let showingWaiting = false
              let cancelled = false
              let spinner = new Spinner({ scale: 1.0 }).spin()
              let disabledInput
              let waiter = {
                showWaiting: function () {
                  if (!showingWaiting && !cancelled) {
                    showingWaiting = true
                    target.addClass('saving')
                    const savePlaceholder = target.nextAll('.save-placeholder')
                    if (savePlaceholder.length > 0) {
                      savePlaceholder.append(spinner.el)
                      disabledInput = savePlaceholder.prevAll('input,select')
                      disabledInput.attr('disabled', 'disabled')
                    } else {
                      $('#growler').show()
                    }
                    setTimeout(this.done, 10000)
                  }
                },
                done: function () {
                  if (showingWaiting) {
                    if (disabledInput) {
                      disabledInput.attr('disabled', false)
                    }
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
              ractive.set('rdfType', 'Publication')
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

        const loadResourceOfQuery = function (applicationData) {
          var query = URI.parseQuery(URI.parse(document.location.href).query)
          var tab = query.openTab
          var externalSources = _.compact(_.flatten([ query.externalSource ]))
          if (externalSources && externalSources.length > 0) {
            applicationData.externalSources = externalSources
          }
          if (query.preferredSource) {
            applicationData.preferredSource = query.preferredSource
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
                var unknownPredefinedValues = JSON.parse(window.sessionStorage.unknownPredefinedValues)
                _.each(unknownPredefinedValues, function (ractiveData) {
                  ractive.set(ractiveData.keypath, ractiveData.value)
                })
                var supportableInputs = JSON.parse(window.sessionStorage.supportableInputs)
                _.each(supportableInputs, function (ractiveData) {
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

        const initHeadlineParts = function (applicationData) {
          const headlineParts = []
          forAllGroupInputs(function (input, groupIndex, inputIndex, subInputIndex) {
            if (input.headlinePart) {
              const subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
              let keypath
              const headlinePart = {}
              if (input.type === 'select-predefined-value') {
                headlinePart.predefinedValue = true
                keypath = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}.values.0.current.value[0]`
              } else {
                const valuePart = input.type === 'searchable-with-result-in-side-panel' ? 'displayValue' : 'value'
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

        const initInputLinks = function (applicationData) {
          const inputLinks = {}
          forAllGroupInputs(function (input, groupIndex, inputIndex, subInputIndex) {
            if (input.id) {
              if (inputLinks[ input.id ]) {
                throw new Error(`Duplicate input id: "${input.id}"`)
              }
              const subInputPart = subInputIndex !== undefined ? `.subInputs.${subInputIndex}.input` : ''
              inputLinks[ input.id ] = `inputGroups.${groupIndex}.inputs.${inputIndex}${subInputPart}`
            }
          }, { handleInputGroups: true })
          ractive.set('inputLinks', inputLinks)
          applicationData.inputLinks = inputLinks
          return applicationData
        }

        const initInputInterDependencies = function (applicationData) {
          let setInputVisibility = function (inputKeypath, visible) {
            ractive.set(`${inputKeypath}.visible`, Boolean(visible).valueOf())
              .then(positionSupportPanels.bind(null, undefined, tabIdFromKeypath(inputKeypath)))
              .then(Main.repositionSupportPanelsHorizontally)
          }
          const alternativeKeypathMap = {}
          const handleVisibility = function (input, groupIndex, inputIndex, subInputIndex, alternativeKeypath) {
            if (input.showOnlyWhen) {
              if (!input.id) {
                throw new Error(`Input "${input.label}" should have its own id attribute in order to handle dependency of input with id "${input.showOnlyWhen.inputId}"`)
              }
              let inputKeypath = alternativeKeypathMap[ applicationData.inputLinks[ input.showOnlyWhen.inputId ] ] || applicationData.inputLinks[ input.showOnlyWhen.inputId ]
              const inputLink = alternativeKeypath || applicationData.inputLinks[ input.id ]
              if (input.showOnlyWhen.valueAsStringMatches) {
                ractive.observe(`${inputKeypath}.values.*.current.value`, function (newValue, oldValue) {
                  if (newValue !== oldValue) {
                    setInputVisibility(inputLink, `${_.isArray(newValue) ? newValue[ 0 ] : newValue}`.match(input.showOnlyWhen.valueAsStringMatches) !== null)
                  }
                }, { init: false })
              }
              if (input.showOnlyWhen.initial && input.showOnlyWhen.initial === 'hide') {
                setInputVisibility(inputLink, false)
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
          }
          forAllGroupInputs(handleVisibility, { handleInputGroups: true })
          _.chain(ractive.get('applicationData.inputsForDomainType')).pairs().each(function (pair) {
            let type = pair[ 0 ]
            let inputs = pair[ 1 ]
            _.each(inputs, function (input, inputIndex) {
              if (input.keypath || input.subInputs) {
                if (input.subInputs) {
                  _.each(input.subInputs, function (subInput, subInputIndex) {
                    const inputKeypath = subInput.input.keypath.replace(
                      /^inputGroups\.[0-9]+\.inputs\.[0-9]+\.subInputs\.[0-9]+\.input/,
                      `applicationData.inputsForDomainType.${input.rdfType}.${inputIndex}.subInputs.${subInputIndex}.input`)
                    alternativeKeypathMap[ subInput.input.keypath ] = inputKeypath
                    handleVisibility(subInput.input, undefined, undefined, undefined, inputKeypath)
                  })
                } else {
                  const inputKeypath = input.keypath.replace(/^inputGroups\.[0-9]+\.inputs\.[0-9]+/, `applicationData.inputsForDomainType.${type}.${inputIndex}`)
                  alternativeKeypathMap[ input.keypath ] = inputKeypath
                  handleVisibility(input, undefined, undefined, undefined, inputKeypath)
                }
              }
            })
          })
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
          .then(extractConfig)
          .then(loadTemplate)
          .then(initTranslations)
          .then(initLanguages)
          .then(showGrowler)
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
            setTimeout(positionSupportPanels)
            return applicationData
          })
          .then(function (applicationData) {
            $('.focusguard-end').on('focus', function () {
              $('.focusguard-start.visible + div :input:first').focus()
            })

            $('.focusguard-start').on('focus', function () {
              $('a:last').focus()
            })
            if (query.copy) {
              $('body').addClass('copy')
            }
            return applicationData
          })
          .then(hideGrowler)
        // .catch(function (err) {
        //   console.log('Error initiating Main: ' + err)
        // })
      },
      repositionSupportPanelsHorizontally: function () {
        const rightDummyPanel = $('#right-dummy-panel')
        if (rightDummyPanel.length > 0) {
          supportPanelLeftEdge = rightDummyPanel.position().left
          supportPanelWidth = rightDummyPanel.width()

          if (supportPanelLeftEdge > 0) {
            $('.support-panel').each(function (index, panel) {
              $(panel).css({ left: supportPanelLeftEdge, width: supportPanelWidth })
            })
          }
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
