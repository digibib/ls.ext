export function inPreferredLanguage (literals) {
  if (!literals || Object.keys(literals).length === 0) {
    return undefined
  }
  if (literals.nb) { // 1. Norsk bokmål
    return literals.nb
  }
  if (literals.nn) { // 2. Norsk nynorsk
    return literals.nn
  }
  if (literals.en) { // 3. Engelsk
    return literals.en
  }
  for (var lang in literals) { // 4. Velg et vilkårlig språk
    return literals[lang]
  }
}
