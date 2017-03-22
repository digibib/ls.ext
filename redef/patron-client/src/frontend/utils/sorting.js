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
  const groups = groupBy(items, 'branchcode')
  const res = []
  Object.keys(groups).forEach(branchcode => {
    res.push({ branchcode: branchcode, items: groups[ branchcode ] })
  })

  return res
}

export function groupByMediaType (items) {
  const groups = groupBy(items, 'mediaTypeURI')
  const res = []
  Object.keys(groups).forEach((mediaTypeURI) => {
    res.push({ mediaTypeURI: mediaTypeURI, items: groups[ mediaTypeURI ] })
  })

  return res
}
