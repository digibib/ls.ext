export function isPersonWithOrdinal (subject) {
  return subject.type === 'Person' && subject.ordinal
}

export function createLabelForPersonWithOrdinal (subject) {
  if (isPersonWithOrdinal(subject)) {
    const specificationString = subject.specification ? ` (${subject.specification})` : ''
    return `${subject.name} ${subject.ordinal}${specificationString}`
  } else {
    return null
  }
}
