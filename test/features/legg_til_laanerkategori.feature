# encoding: UTF-8
# language: no


Egenskap: Legge til lånerkategori
  Som systemadministrator
  For å kunne legge til lånere
  Ønsker jeg å legge inn en lånekategori

  @wip
  Scenario: Legge til lånerkategori via webgrensesnitt
    Gitt at jeg er pålogget som adminbruker
    Og at det finnes en avdeling
    Når jeg legger til en brukerkategori
    Så kan jeg se brukerkategorien i listen over brukerkategorier

  