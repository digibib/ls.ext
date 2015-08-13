# encoding: UTF-8
# language: no

@redef @no-browser
Egenskap: Legge til og endre utgivelse via API
  Som katalogiseringsgrensesnitt
  For å kunne hjelpe katalogisator med å katalogisere
  Ønsker jeg å kunne legge til og endre utgivelse via servicelagets API

  Scenario: Legge til utgivelse via API
    Gitt at jeg har en ontologi som beskriver utgivelse
    Når jeg legger inn en utgivelse via APIet
    Så viser APIet at utgivelsen finnes

  Scenario: Endre utgivelse via API
    Gitt at det er opprettet en utgivelse
    Når jeg sender inn endringer i utgivelsen til APIet
    Så viser APIet at endringene i utgivelsen er lagret

  Scenario: Se utgivelse på verk via API
    Gitt at jeg har en ontologi som beskriver utgivelse
    Når jeg legger inn et verk via APIet
    Og jeg legger inn en utgivelse via APIet
    Og kopler utgivelsen til verket
    Så viser APIet at verket har opplysninger om utgivelsen
