# encoding: UTF-8
# language: no

@redef @arbeidsflyt @check-for-errors
Egenskap: Katalogisere i arbeidsflyt
  Som katalogisator
  Ønsker jeg å kunne katalogisere en bok

  @wip
  Scenario: Verifisere resulterende utgivelse fra arbeidsflyt med eksisterende person og verk
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til bekreft verk
    Og verifiserer at verkets basisopplysninger uten endringer er korrekte
    Og bekrefter for å gå videre til beskriv verket
    Og verifiserer verkets tilleggsopplysninger uten endringer er korrekte
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og legger inn opplysningene om utgivelsen
    Og jeg åpner utgivelsen i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om utgivelsen
    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  @wip
  Scenario: Verifisere resulterende utgivelse fra arbeidsflyt med eksisterende person
    Gitt at jeg har en bok
    Og at jeg har lagt til en person
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og bekrefter for å gå videre til bekreft verk
    Og legger inn basisopplysningene om verket for hovedtittel og undertittel
    Og bekrefter for å gå videre til beskriv verket
    Og legger inn tilleggsopplyningene om verket for utgivelsesår og språk
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og legger inn opplysningene om utgivelsen
    Og jeg åpner utgivelsen i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om utgivelsen
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om verket
    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  @wip
  Scenario: Verifisere endring av verksopplysninger
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til bekreft verk
    Og legger inn basisopplysningene om verket for hovedtittel og undertittel
    Og bekrefter for å gå videre til beskriv verket
    Og legger inn tilleggsopplyningene om verket for utgivelsesår og språk
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om verket

