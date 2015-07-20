# encoding: UTF-8
# language: no

@redef @wip
Egenskap: Legge til og endre utgivelse
  Som katalogiseringsgrensesnitt
  For å kunne hjelpe katalogisator med å katalogisere
  Ønsker jeg å kunne legge til og endre utgivelse via servicelagets API

  Scenario: Legge til utgivelse
    Gitt at jeg har en ontologi som beskriver utgivelse
    Når jeg legger inn en utgivelse via APIet
    Så viser APIet at utgivelsen finnes

  Scenario: Endre utgivelse
    Gitt at det er opprettet en utgivelse
    Når jeg sender inn endringer i utgivelsen til APIet
    Så viser APIet at endringene i utgivelsen er lagret
