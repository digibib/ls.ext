import { browserHistory } from 'react-router'

let createPath = undefined

if (typeof window !== 'undefined') {
  createPath = browserHistory.createPath
}

export default createPath