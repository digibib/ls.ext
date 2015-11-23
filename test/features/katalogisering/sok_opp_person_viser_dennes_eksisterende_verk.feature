# encoding: UTF-8
# language: no

@redef
Egenskap: Søk opp person og se at denne har andre verk fra før
  Som katalogisator
  Ønsker jeg å kunne se andre verk en person har skrevet for å kunne velge riktig person

  Bakgrunn:
    Gitt at jeg har lagt til en person
    Og at jeg er i katalogiseringsgrensesnittet
    Og at systemet har returnert en ny ID for det nye verket
    Og at verket har en tittel
    Og jeg søker på navn til opphavsperson for det nye verket
    Og velger person fra en treffliste
    Så viser systemet at opphavsperson til verket har blitt registrert

  Scenario: Katalogisator søker opp opphavsperson for et verk og kan velge riktig ugr fra verkene vedkommende har skrevet tidligere
    Når at jeg er i katalogiseringsgrensesnittet
    Og at systemet har returnert en ny ID for det nye verket
    Og jeg søker på navn til opphavsperson for det nye verket
    Så viser trefflisten at personen har et verk fra før
