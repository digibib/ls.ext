# encoding: UTF-8
# language: no

@wip
Egenskap: Varsling på epost
  Som en bruker
  Siden jeg liker å holde meg oppdatert
  Ønsker jeg å kunne motta varsler fra biblioteket

  Bakgrunn:
    Gitt at jeg er pålogget som adminbruker
    Og at det finnes en låner med passord
    Og et verk med en utgivelse og et eksemplar

  @wip
  Scenario: Epost om reservert tittel som er klar til avhenting
    Gitt at bok er reservert av låner
    Og boka sjekkes inn på låners henteavdeling
    Så vil låneren få epost om at boka er klar til avhenting

  @wip
  Scenario: Epost om bok som skulle vært levert
    Gitt at eksemplaret er utlånt til en låner
    Så vil låneren få epost om at boka skulle vært levert på forfallsdato
