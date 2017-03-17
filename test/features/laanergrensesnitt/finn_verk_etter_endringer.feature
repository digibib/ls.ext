# encoding: UTF-8
# language: no

@redef
@check-for-errors
Egenskap: Finn verk etter endringer
  Som katalogisator
  Så ønsker jeg å kunne finne et verk etter å ha endret tittelen
  Og kunne finne et verk ved å søke på forfatteren etter å ha endret navnet på forfatteren

  Bakgrunn:
    Gitt at det finnes 1 verk med 1 utgivelser og 1 personer

  Scenario: Verk har endret tittel
    Når jeg endrer tittelen på verket
    Og jeg tar meg en matbit
    Og jeg søker på verket i lånergrensesnittet
    Så jeg vil finne verket i trefflista

  Scenario: Verk har endret person
    Når jeg endrer forfatteren på verket
    Og jeg søker på verkets forfatter i lånergrensesnittet
    Så jeg vil finne verket i trefflista

  Scenario: Person har endret navn
    Når jeg endrer navnet på personen
    Og jeg søker på verkets forfatter i lånergrensesnittet
    Så jeg vil finne verket i trefflista