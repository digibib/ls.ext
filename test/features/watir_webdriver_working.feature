# encoding: UTF-8
# language: no

Egenskap: Watir-webdriver fungerer med cucumber
  Som utviklere vil vi ikke teste manuelt i nettleseren
  For å sikre at våre web-baserte grensesnitt fungerer nå og i fremtiden
  Ønsker vi å bruke watir for å automatisere tester i nettleseren

  Scenario: Søk i google
    Gitt at vi kan søke i google
    Når vi søker etter deichman
    Så vil vi finne "Deichmanske bibliotek"
