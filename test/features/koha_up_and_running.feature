# encoding: UTF-8
# language: no

Egenskap: tilgjengelig koha installasjon
  Som administrator
  For å sikre at koha er klar til bruk
  Ønsker jeg å bruke salt til å automatisere installasjon av koha i vagrant

  Scenario: Nå kohas korrekte oppstartsside
    Når jeg forsøker å nå koha over http
    Så vil jeg få http ok tilbake
