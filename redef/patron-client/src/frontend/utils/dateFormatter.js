export function formatDate (date) {
  if (date) {
    const formattedDate = new Intl.DateTimeFormat('nb', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(Date.parse(date.replace(/-/g, '/')))
    return formattedDate
  }
}
