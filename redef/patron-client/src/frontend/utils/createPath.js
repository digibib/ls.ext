import { browserHistory } from 'react-router'

let createPath

if (typeof window !== 'undefined') {
  createPath = browserHistory.createPath
}

export default createPath
