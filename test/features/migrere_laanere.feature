# encoding: UTF-8
# language: no

@wip
Egenskap: Migrere lånere fra Bibliofil til Koha
  Som ansvarlig og serviceinnstilt bibliotek-ansatt
  For å sørge for at lånere skal kunne bruke bibliotektets tjenester uavhengig av system
  Ønsker jeg å migrere lånerdata fra Bibliofil til Koha

Bakgrunn:
  Gitt at det finnes en eksport av alle lånere som finnes Bibliofil
  Og at det finnes verktøy for å behandle eksporten til et format som Koha kan håndtere
  Og at det finnes verktøy for å gjøre utvalg av lånere som skal migreres

  Scenario: Importere lånere via Koha's webgrensesnitt

  Scenario: Importere lånere direkte inn i MySQL

  Scenario: Importere lånere via Koha-RESTFULL