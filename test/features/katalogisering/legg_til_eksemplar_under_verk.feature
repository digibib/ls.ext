# encoding: UTF-8
# language: no

@wip
@check-for-errors
Egenskap: Legg til eksemplar under verk
  Som katalogisator
  For å kunne registrere et nytt eksemplar
  Ønsker jeg å kople et eksemplar til et verk i systemet

  Bakgrunn:
    Gitt at jeg er logget inn som katalogisator

  @wip
  Scenario: Katalogisator legger til nytt eksemplar
    Gitt at jeg er i katalogiseringsgrensesnittet
    Når jeg legger inn eksemplaret under et verk
    Så viser systemet at eksemplaret er tilgjengelig i systemet når en søker opp verket
