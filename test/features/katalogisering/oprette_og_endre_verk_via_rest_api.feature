# encoding: UTF-8
# language: no

@rest
Egenskap: Legge til og endre verk
  Som katalogiseringsgrensesnitt
  For å kunne hjelpe katalogisator med å katalogisere
  Ønsker jeg å kunne legge til og endre verk via servicelagets API

  Scenario: Legge til verk
    Gitt at jeg har en ontologi som beskriver verk
    Når jeg legger inn et verk via APIet
    Så viser APIet at verket finnes

  @wip
  Scenario: Endre verk
    Gitt at det er opprettet et verk
    Når jeg sender inn endringer til APIet
    Så viser APIet at endringene er lagret
