export function sortByField (inputArray, field, descending = false) {
  if (descending) {
    return [ ...inputArray ].sort((a, b) => b[field].localeCompare(a[field]))
  } else {
    return [ ...inputArray ].sort((a, b) => a[field].localeCompare(b[field]))
  }
}
