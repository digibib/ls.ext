# encoding: UTF-8
# language: no

@redef
@check-for-errors
@wip
Egenskap: Se felter i Koha
  Som bibliotekar
  Skal jeg kunne se utvalgt data om en utgivelse i Koha

  Bakgrunn:
    Gitt at jeg er logget inn som superbruker
    Og at jeg er i katalogiseringsgrensesnittet

  Scenario: Finn utgivelsestittel og forfatter i Koha
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til bekreft verk
    Og bekrefter for å gå videre til beskriv verket
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og legger inn opplysningene om utgivelsen
    Og jeg følger lenken til posten i Koha i arbeidsflyten
    Så skal jeg se tittel, deltittel, delnummer, forfatter, utgivelsesår og ISBN