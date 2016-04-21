# encoding: UTF-8
# language: no

Egenskap: Reservering av bok via API
  Som låner
  For å få tak i en bestemt bok
  Ønsker jeg å reservere boka

Bakgrunn:
  Gitt at jeg er autentisert som superbruker via REST API
  Og at boka finnes i biblioteket
  Og at det finnes en låner med passord

  Scenario: Låner reserverer bok via API
    Gitt at låner er pålogget som låner (Opac)
    Og at låneren har funnet en bok
    Og at boka er tilgjengelig (Opac)
    Når låneren reserverer boka via API
    Så gir APIet tilbakemelding om at boka er reservert

  @wip
  Scenario: Låner reserverer bok på verkssiden
    Gitt at låneren har funnet en bok
    Og at låneren går inn på verkssiden
    Når låneren reserverer boka på verkssiden
    Og låneren autentiserer seg
    Og låneren velger henteavdeling på boka og trykker reserver
    Så får låneren tilbakemelding om at boka er reservert