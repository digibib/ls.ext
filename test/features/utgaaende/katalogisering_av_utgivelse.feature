# encoding: UTF-8
# language: no

@ignore
@redef
@check-for-errors
@wip
Egenskap: Katalogisering av utgivelse
  Som katalogisator
  For at brukere skal kunne finne rett utgivelse
  Ønsker jeg å registrere utgivelser med format og språk

  Scenario: Verk finnes - utgivelse finnes ikke
    Gitt at det finnes et verk
    Når jeg registrerer inn opplysninger om utgivelsen
    Og jeg knytter utgivelsen til verket
    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  Scenario: Verk finnes - utgivelse finnes ikke (2)
    Gitt at det finnes et verk
    Når jeg vil katalogisere en utgivelse
    Så får utgivelsen tildelt en post-ID i Koha
    Og det vises en lenke til posten i Koha i katalogiseringsgrensesnittet

  Scenario: Utgivelse med eksemplar
    Gitt at det finnes et verk og en utgivelse
    Når jeg ser på utgivelsen i katalogiseringsgrensesnittet
    Og jeg følger lenken til posten i Koha
    Og jeg oppretter et eksemplar av utgivelsen
    Så vises eksemplaret på verkssiden

  @wip
  Scenario: Verk og utgivelse finnes ikke

  @wip
  Scenario: Utgivelse finnes
