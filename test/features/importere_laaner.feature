# encoding: UTF-8
# language: no

@wip
Egenskap: Import av låner
  Som adminbruker
  For å slippe å registrere eksisterende lånere på nytt
  Ønsker jeg å importere lånerdata fra eksisterende system

  @wip
  Scenario: Bibliofil-låner
    Gitt at det finnes data som beskriver en låner
    Og at låneren ikke finnes som låner hos biblioteket fra før
    Når dataene importeres
    Så viser systemet at låneren er registrert som låner