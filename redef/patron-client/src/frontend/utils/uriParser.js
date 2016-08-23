import urijs from 'urijs'

export function relativeUri (uri) {
  return urijs(uri).path()
}

export function getId (uri) {
  return uri.substring(uri.lastIndexOf('/') + 1)
}

export function getFragment (uri) {
  return uri.substring(uri.lastIndexOf('#') + 1)
}