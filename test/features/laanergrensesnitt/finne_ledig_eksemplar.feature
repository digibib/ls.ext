# encoding: UTF-8
# language: no

@redef
Egenskap: Finne ledige eksemplar av et bestemt utgivelse
  Som bruker av bibliotekets websider
  For å kunne låne et eksemplar av en utgivelse
  Ønsker jeg å kunne se hvor eksemplarene er og om de er ledig

  Bakgrunn:
    Gitt at jeg er logget inn som superbruker
    Og et verk med en utgivelse og et eksemplar

  Scenario: Se hvor eksemplaret er
    Når jeg er på sida til verket
    Så ser jeg oppstillinga av eksemplaret

  Scenario: Se at eksemplaret er ledig
    Når jeg er på sida til verket
    Så ser jeg at eksemplaret er ledig
