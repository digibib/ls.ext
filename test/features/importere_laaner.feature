# encoding: UTF-8
# language: no

@wip
Egenskap: Import av låner
  Som adminbruker
  For å slippe å registrere eksisterende lånere på nytt
  Ønsker jeg å importere lånerdata fra eksisterende system

  Bakgrunn:
    Gitt at en låner ikke finnes som låner hos biblioteket fra før
    Og at det finnes data som beskriver en låner

  @wip
  Scenario: Konvertering av låner
    Gitt at det finnes en mapping for konvertering
    Når lånerdata migreres
    Så samsvarer de migrerte lånerdata med mapping

  @wip
  Scenario: Import av konverterte lånerdata
    Gitt at det finnes konverterte data
    Når lånerdata importeres i admingrensesnittet
    Så viser systemet at låneren er låner
