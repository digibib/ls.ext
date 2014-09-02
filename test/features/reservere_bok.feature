# encoding: UTF-8
# language: no

@wip
Egenskap: Reservering av bok
  Som låner
  For å få tak i en bestemt bok
  Ønsker jeg å reservere boka

Bakgrunn:
  Gitt at det finnes en låner
  Og at det finnes en bok

  @wip
  Scenario:
    Gitt at låner er pålogget som låner
    Og at låneren har funnet en bok
    Og at boka er tilgjengelig
  	Når låneren reserverer boka
    Så viser systemet at boka er reservert av låneren