import urijs from 'urijs'

export function relativeUri (uri) {
  return urijs(uri).path()
}
