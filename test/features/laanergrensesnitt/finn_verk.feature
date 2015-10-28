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

  Scenario: Ikke finn treff fra irrelevante felter
    Gitt at det finnes et verk
    Når jeg søker på verket i lånergrensesnittet
    Så vil jeg finne verket i trefflista
    Når jeg søker på verkets ID i lånergrensesnittet
    Så skal ikke verket finnes i trefflisten

  Scenario: Søk etter ord i tittel for å finne verk
    Gitt at det finnes et verk med tre ledd i tittelen
    Når jeg søker på verket i lånergrensesnittet basert på det første og siste leddet i tittelen
    Så vil jeg finne verket i trefflista