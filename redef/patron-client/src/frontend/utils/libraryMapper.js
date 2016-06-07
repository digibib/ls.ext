import { sortByField } from '../utils/sorting'

export function mapLibraries (libraries) {
  const mappedLibraries = {}
  sortByField(libraries, 'branchname').forEach(library => {
    mappedLibraries[ library.branchcode ] = library.branchname
  })
  return mappedLibraries
}
