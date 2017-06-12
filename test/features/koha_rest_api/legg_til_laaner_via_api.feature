# encoding: UTF-8
# language: no

@kohadb
Egenskap: Legg til låner via API
  Som bruker
  For å kunne bruke bibliotekets tjenester
  Ønsker jeg å kunne registrere meg

  Bakgrunn:
    Gitt at jeg er autentisert som superbruker via REST API

  Scenario: Systemet registrerer ny låner via API
    Gitt at jeg har mottatt opplysninger om en låner
    Når jeg registrerer låneren via API
    Så gir APIet tilbakemelding om at låneren er registrert