# encoding: UTF-8
# language: no

@redef
Egenskap: Katalogisering av bok
  Som katalogisator
  For at brukere skal kunne låne ei bok
  Ønsker jeg å registrere boka

  @wip
  Scenario: Verk finnes - utgivelse finnes — boka finnes ikke
    Gitt at det finnes et verk
    Og at det finnes en utgivelse koplet til verket
    Når jeg registrerer opplysninger om boka
    Og jeg knytter boka til utgivelsen
    Så vises opplysningene om boka på verkssiden