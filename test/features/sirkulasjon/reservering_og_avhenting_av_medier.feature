# encoding: UTF-8
# language: no

@kohadb
Egenskap: Reservering og avhenting av medier
  Som låner
  For å slippe å lete selv
  Ønsker jeg å kunne reservere medier som jeg kan hente

  Scenario: Låner reserverer to eksemplarer av samme tittel
    Gitt at Koha er populert med 1 lånere, 2 eksemplarer og 2 reserveringer
    Når eksemplar "1" blir innlevert på "henteavdeling"
    Så gir systemet tilbakemelding om at at reservasjon "1" er klar til avhenting på "hutl"
    Og låner får hentemelding med hentenummer på eksemplar "1"
    Når eksemplar "2" blir innlevert på "henteavdeling"
    Så gir systemet tilbakemelding om at at reservasjon "2" er klar til avhenting på "hutl"
    Og låner får hentemelding med hentenummer på eksemplar "2"
