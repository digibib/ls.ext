# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Finne ledige eksemplar av et bestemt utgivelse
  Som bruker av bibliotekets websider
  For å kunne låne et eksemplar av en utgivelse
  Ønsker jeg å kunne se hvor eksemplarene er og om de er ledig

  Scenario: Se hvor eksemplaret er
    Gitt et verk med en utgivelse
    Når jeg er på sida til verket
    Så ser jeg lokasjon og oppstillinga av eksemplaret

  Scenario: Se at eksemplaret er ledig
    Gitt et verk med en utgivelse
    Når jeg er på sida til verket
    Så ser jeg at boka er ledig

  Scenario: Se at eksemplaret er ledig
    Gitt et verk med en utgivelse
    Når jeg er på sida til verket
    Så ser jeg at boka ikke er ledig
