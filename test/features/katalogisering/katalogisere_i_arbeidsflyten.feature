# encoding: UTF-8
# language: no

@redef @arbeidsflyt @check-for-errors
Egenskap: Katalogisere i arbeidsflyt
  Som katalogisator
  Ønsker jeg å kunne katalogisere en bok

  Scenario: Katalogisator oppretter ny utgivelse fra eksisterende verdier
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til bekreft verk
    Og bekrefter at verkets basisopplysninger uten endringer er korrekte
    Og bekrefter verkets tilleggsopplysninger uten endringer er korrekte
    Og legger inn opplysningene om utgivelsen for hovedtittel, undertittel, år, format og språk
    Så vises opplysningene om utgivelsen på verkssiden