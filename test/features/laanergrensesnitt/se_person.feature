# encoding: UTF-8
# language: no

@redef
@wip
Egenskap: Se person
  Som bruker av bibliotekets nettsider
  Siden jeg er interessert i bibliografiske mennesker
  Ønsker jeg å se opplysninger om personer

  @biblioMove
  Scenario: Se på opplysninger om person på personsiden
    Gitt at det finnes en personressurs
    Når jeg er på informasjonssiden til personen
    Så ser jeg personens navn
    Og så ser jeg utfyllende informasjon om personen
