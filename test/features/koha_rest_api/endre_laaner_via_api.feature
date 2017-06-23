# encoding: UTF-8
# language: no

Egenskap: Endre låner via API
  Som flyktig bruker
  For å kunne fortsette å bruke bibliotekets tjenester
  Ønsker jeg å kunne endre mine egne brukeropplysninger

Bakgrunn:
  Gitt at jeg er autentisert som superbruker via REST API

  @kohadb
  Scenario: Låner endrer meldingspreferanser
    Gitt at det er registrert en låner via API
    Og låner vil endre meldingspreferanser
    Når nye meldingspreferanser sendes til Kohas API
    Så gir APIet tilbakemelding om at de nye meldingspreferansene er registrert
