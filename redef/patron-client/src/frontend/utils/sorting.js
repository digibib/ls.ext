export function sortByField (inputArray, field, descending = false) {
  if (descending) {
    return [ ...inputArray ].sort((a, b) => b[ field ].localeCompare(a[ field ]))
  } else {
    return [ ...inputArray ].sort((a, b) => a[ field ].localeCompare(b[ field ]))
  }
}

function groupBy (xs, key) {
  return xs.reduce((rv, x) => {
    (rv[ x[ key ] ] = rv[ x[ key ] ] || []).push(x)
    return rv
  }, {})
}

export function groupByBranch (items) {
  const groups = groupBy(items, 'branch')
  const res = []
  Object.keys(groups).forEach(branch => {
    res.push({ branch: branch, items: groups[ branch ] })
  })

  return res
}
