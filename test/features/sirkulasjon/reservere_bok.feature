# encoding: UTF-8
# language: no

@wip
Egenskap: Reservering av bok
  Som låner
  For å få tak i en bestemt bok
  Ønsker jeg å reservere boka

Bakgrunn:
  Gitt at det finnes en låner
  Og at boka finnes i biblioteket

  @wip
  Scenario:
    Gitt at låner er pålogget som låner
    Og at låneren har funnet en bok
    Og at boka er tilgjengelig
  	Når låneren reserverer boka
    Så viser systemet at boka er reservert av låneren

  @wip
  Scenario:
    Gitt at bok er reservert av låner
    Og at boka er utlånt
    Når boka registreres innlevert
    Så viser systemet at boka holdes av til låneren