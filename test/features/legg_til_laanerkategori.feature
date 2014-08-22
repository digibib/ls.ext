# encoding: UTF-8
# language: no

Egenskap: Legge til lånerkategori
  Som systemadministrator
  For å kunne legge til lånere
  Ønsker jeg å legge inn en lånerkategori

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  Scenario: Legge til minimal lånerkategori via webgrensesnitt
    Når jeg legger til en lånerkategori
    Så kan jeg se kategorien i listen over lånerkategorier
