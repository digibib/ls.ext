# encoding: UTF-8
# language: no

@redef @wip
Egenskap: Legge til og endre utgivelse
  Som katalogiseringsgrensesnitt
  For å kunne hjelpe katalogisator med å katalogisere
  Ønsker jeg å kunne legge til og endre utgivelse via servicelagets API

  Scenario: Legge til utgivelse
    Gitt at jeg har en ontologi som beskriver utgivelse
    Når jeg legger inn et utgivelse via APIet
    Så viser APIet at utgivelseet finnes

  Scenario: Endre utgivelse
    Gitt at det er opprettet et utgivelse
    Når jeg sender inn endringer til APIet
    Så viser APIet at endringene er lagret
