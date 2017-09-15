export default function fieldQueryLink (field, query) {
  // let template = `${field}:${query}`
  // if (query.includes(' ')) {
  const template = `${field}:"${query}"`
  // }
  const escapedQuery = encodeURIComponent(template)
  return `/search?query=${escapedQuery}`
}
