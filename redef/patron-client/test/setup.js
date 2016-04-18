import { jsdom } from 'jsdom'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'

global.document = jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = global.window.navigator
global.localStorage = {}

let findElementsByDataAutomationId = (root, dataAutomationId, startsWith) => {
  return TestUtils.findAllInRenderedTree(root, (inst) => {
    if (TestUtils.isDOMComponent(inst)) {
      const node = ReactDOM.findDOMNode(inst)
      if (startsWith) {
        return dataAutomationId.startsWith(node.getAttribute('data-automation-id'))
      } else {
        return dataAutomationId === node.getAttribute('data-automation-id')
      }
    }
    return false
  })
}

let findElementByDataAutomationId = (root, dataAutomationId, startsWith) => {
  let all = findElementsByDataAutomationId(root, dataAutomationId, startsWith)
  if (all.length !== 1) {
    throw new Error(
      `Did not find exactly one match (found: ${all.length}) for data automation id: ${dataAutomationId}`
    )
  }
  return all[ 0 ]
}

global.findElementsByDataAutomationId = findElementsByDataAutomationId
global.findElementByDataAutomationId = findElementByDataAutomationId

let error = console.error
console.error = warning => {
  if (/(Invalid prop|Failed propType|flattenChildren|React Intl|)/.test(warning)) {
    throw new Error(`Test failed because of warning (warnings not allowed): ${warning}`)
  }
  error.apply(console, arguments)
}
