# encoding: UTF-8
# language: no

@redef
Egenskap: Finn verk
  Som bruker av biblioteket
  For å finne et verk, ønsker jeg å kunne søke på verk

  Scenario: Finn verk
    Gitt at det finnes et verk
    Når jeg søker på verket i lånergrensesnittet
    Så vil jeg finne verket i trefflista
