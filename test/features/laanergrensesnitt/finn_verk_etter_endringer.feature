# encoding: UTF-8
# language: no

@redef
@check-for-errors
Egenskap: Finn verk etter endringer
  Som katalogisator
  Så ønsker jeg å kunne finne et verk etter å ha endret tittelen
  Og kunne finne et verk ved å søke på forfatteren etter å ha endret navnet på forfatteren

  Bakgrunn:
    Gitt at jeg har lagt til en person
    Og at det finnes et verk
    Og jeg legger til forfatter av det nye verket

  Scenario: Verk har endret tittel
    Når når jeg endrer tittelen på verket
    Og jeg søker på verket i lånergrensesnittet
    Så jeg vil finne verket i trefflista

  Scenario: Verk har endret person
    Når jeg endrer forfatteren på verket
    Og jeg søker på verkets forfatter i lånergrensesnittet
    Så jeg vil finne verket i trefflista

  Scenario: Person har endret navn
    Når jeg åpner personen for redigering
    Og når jeg endrer navnet på personen
    Og jeg søker på verkets forfatter i lånergrensesnittet
    Så jeg vil finne verket i trefflista