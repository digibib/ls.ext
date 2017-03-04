import { sortByField } from '../utils/sorting'

export function mapLibraries (libraries) {
  const mappedLibraries = {}
  sortByField(libraries, 'branchname').forEach(library => {
    mappedLibraries[ library.branchcode ] = library.branchname
  })
  return mappedLibraries
}

export function filterPickupLibrariesByItems (libraries, items) {
  const res = {}
  const itemBranches = []
  items.forEach(i => { itemBranches.push(i.branchcode) })
  if (itemBranches in libraries) {
    res[itemBranches] = libraries[itemBranches]
  }
  return res
}
