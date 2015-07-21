# encoding: UTF-8
# language: no

@redef
Egenskap: Katalogisering av utgivelse
  Som katalogisator
  For at brukere skal kunne finne rett utgivelse
  Ønsker jeg å registrere utgivelser med format og språk

  @wip
  Scenario: Verk finnes - utgivelse finnes ikke
    Gitt at det finnes et verk
    Når jeg registrerer inn opplysninger om utgivelsen
    Og jeg knytter utgivelsen til verket
    Så vises opplysningene om utgivelsen på verkssiden

  @wip
  Scenario: Verk og utgivelse finnes ikke

  @wip
  Scenario: Utgivelse finnes
