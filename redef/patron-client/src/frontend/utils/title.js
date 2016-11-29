export default function title (input) {
  const { mainTitle, subtitle, partTitle, partNumber } = input
  return `${mainTitle}${(subtitle || partNumber || partTitle) ? ' :' : ''}${subtitle ? ` ${subtitle}.` : ''}${partNumber ? ` ${partNumber}.` : ''}${partTitle ? ` ${partTitle}` : ''}`
}
