# encoding: UTF-8
# language: no

@kohadb
Egenskap: Avdelinger via API
  Som superbruker
  For å finne en avdeling
  Ønsker jeg å kunne liste alle avdelinger

  Bakgrunn:
    Gitt at jeg er autentisert som superbruker via REST API

  Scenario: Liste alle avdelinger via API
    Gitt at det finnes en avdeling
    Når jeg lister alle avdelinger via API
    Så forventer jeg å finne avdelingen i listen
