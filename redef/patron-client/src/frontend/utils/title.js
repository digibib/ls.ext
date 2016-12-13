export default function title (input) {
  const { mainTitle, subtitle, partTitle, partNumber } = input
  let title = mainTitle
  if (subtitle) {
    title += ` : ${subtitle}`
  }
  if (partNumber) {
    title += `. ${partNumber}`
  }
  if (partTitle) {
    title += `. ${partTitle}`
  }
  return title
}
