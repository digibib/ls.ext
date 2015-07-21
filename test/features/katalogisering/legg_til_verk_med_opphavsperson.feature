# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Legg til verk med opphavsperson
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent opphavsperson
  Ønsker jeg å registrere at et verk har en opphavsperson

  Bakgrunn:
    Gitt at jeg er i katalogiseringsgrensesnittet

  Scenario: Katalogisator legger inn opphavsperson for et verk
    Gitt at systemet har returnert en ny ID for det nye verket
    Når jeg legger til en opphavsperson for det nye verket
    Så viser systemet at opphavsperson til verket har blitt registrert
    Og verkets opphavsperson vises på verks-siden