# encoding: UTF-8
# language: no

Egenskap: Reservering av bok
  Som låner
  For å få tak i en bestemt bok
  Ønsker jeg å reservere boka

Bakgrunn:
  Gitt at jeg er pålogget som adminbruker
  Og at boka finnes i biblioteket
  Og at det finnes en låner med passord
  Og at jeg er logget på som superbruker via REST API

  Scenario: Eksisterende låner reserverer bok
    Gitt at låner er pålogget som låner (Opac)
    Og at låneren har funnet en bok
    Og at boka er tilgjengelig (Opac)
    Når låneren reserverer boka
    Så viser systemet at boka er reservert av låneren

  @wip
  Scenario: Innlevert bok som er reservert av låner blir holdt av
    Gitt at bok er reservert av låner
    Og at boka er utlånt
    Når boka blir registrert innlevert
    Så viser systemet at boka holdes av til låneren