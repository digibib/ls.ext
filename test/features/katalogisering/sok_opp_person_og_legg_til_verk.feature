# encoding: UTF-8
# language: no

@check-for-errors
@wip @redef
Egenskap: Søk opp person og legg til som opphavsperson for verk
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent opphavsperson
  Ønsker jeg å kunne knytte en opphavsperson til verk ved å søke på personer

  Bakgrunn:
    Gitt at jeg har lagt til en person
    Og at jeg er i katalogiseringsgrensesnittet

  @wip
  Scenario: Katalogisator søker opp og velger opphavsperson for et verk
    Og at systemet har returnert en ny ID for det nye verket
    Og at verket har en tittel
    Når jeg søker på navn til opphavsperson for det nye verket
    Og velger person fra en treffliste
    Så viser systemet at opphavsperson til verket har blitt registrert
