# encoding: UTF-8
# language: no

@wip
Egenskap: Import av låner
  Som adminbruker
  For å slippe å registrere eksisterende lånere på nytt
  Ønsker jeg å importere lånerdata fra eksisterende system

  @wip
  Scenario:
    Gitt at det finnes data som beskriver en låner "Kari"
    Og at "Kari" ikke finnes som låner
    Når dataene importeres til systemet
    Så viser systemet at "Kari" er låner