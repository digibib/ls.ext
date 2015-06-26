# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Legg til verk med tittel
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent tittel
  Ønsker jeg å registrere at et verk har en tittel

  Bakgrunn:
    Gitt at jeg er logget inn som katalogisator
    Gitt at jeg er i katalogiseringsgrensesnittet

  @wip
  Scenario: Katalogisator legger til nytt verk med tittel
    Når jeg legger inn verket som nytt verk
    Og når jeg knytter en tittel til verket
    Så viser systemet at verket har en tittel
