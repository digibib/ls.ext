# encoding: UTF-8
# language: no

@wip
Egenskap: Legg til verk
  Som katalogisator
  For å kunne registrere et nytt eksemplar under et nytt verk
  Ønsker jeg å kunne legge til et verk i systemet

  Bakgrunn:
    Gitt at jeg er logget inn som katalogisator

  @wip
  Scenario: Katalogisator legger til nytt verk
    Gitt at jeg er i katalogiseringsgrensesnittet
    Når jeg legger inn verket som nytt verk
    Så viser systemet at verket kan brukes som autoritet for eksemplarer
