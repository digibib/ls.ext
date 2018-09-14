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
  itemBranches.forEach(branch => {
    res[branch] = libraries[branch]
  })
  return res
}
