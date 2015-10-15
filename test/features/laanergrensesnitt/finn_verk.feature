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
    Og kan klikke på det første verket
    Så ser jeg informasjon om verkets tittel og utgivelsesår

  Scenario: Ikke finn verk
    Når jeg søker på noe som ikke finnes
    Så får jeg beskjed om at det ikke var noen treff
