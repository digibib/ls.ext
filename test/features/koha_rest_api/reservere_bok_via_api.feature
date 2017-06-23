# encoding: UTF-8
# language: no

Egenskap: Reservering av bok via API
  Som låner
  For å få tak i en bestemt bok
  Ønsker jeg å reservere boka

  @kohadb
  Scenario: Låner reserverer bok via API
    Gitt at jeg er logget inn som superbruker
    Og at Koha er populert med 1 lånere, 1 eksemplarer og 0 reserveringer
    Når låneren reserverer boka via API
    Så gir APIet tilbakemelding om at boka er reservert