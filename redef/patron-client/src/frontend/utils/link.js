export default function fieldQueryLink (field, query) {
  const escapedQuery = encodeURIComponent(`${field}:"${query}"`)
  return `/search?query=${escapedQuery}`
}
