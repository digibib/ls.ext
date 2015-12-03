# encoding: UTF-8
# language: no

@redef @arbeidsflyt @wip
Egenskap: Katalogisere i arbeidsflyt
  Som katalogisator
  Ønsker jeg å kunne katalogisere en bok

  @wip
  Scenario: Katalogisator oppretter ny utgivelse fra eksisterende verdier
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre
    Og bekrefter at verkets basisopplysninger uten endringer er korrekte
    Og bekrefter verkets tilleggsopplysninger uten endringer er korrekte
    Og legger inn opplysningene om utgivelsen for hovedtittel, undertittel, år, format og språk
    Og bekrefter at utgivelsesinformasjonen er korrekt
    Så ser jeg at utgivelsen er tilgjengelig i katalogen