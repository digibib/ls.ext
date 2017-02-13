# encoding: UTF-8
# language: no

@redef
Egenskap: Finne ledige eksemplar av et bestemt utgivelse
  Som bruker av bibliotekets websider
  For å kunne låne et eksemplar av en utgivelse
  Ønsker jeg å kunne se hvor eksemplarene er og om de er ledig

  Scenario: Se hvor eksemplaret er
    Gitt et verk med en utgivelse og et eksemplar
    Når jeg er på sida til verket
    Så ser jeg oppstillinga av eksemplaret

  Scenario: Se at eksemplaret er ledig
    Gitt et verk med en utgivelse og et eksemplar
    Når jeg er på sida til verket
    Så ser jeg at eksemplaret er ledig

  @ignore
  Scenario: Se at eksemplaret ikke er ledig
    Gitt et verk med en utgivelse og et eksemplar
    Og at eksemplaret er utlånt til en låner
    Når jeg er på sida til verket
    Så ser jeg at eksemplaret ikke er ledig
