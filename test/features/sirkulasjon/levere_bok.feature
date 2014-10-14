# encoding: UTF-8
# language: no

Egenskap: Innlevering av bok
  Som adminbruker
  For å betjene en låner
  Ønsker jeg å registrere at låneren leverer en lånt bok

  Bakgrunn:
    Gitt at jeg er pålogget som adminbruker
    Og at boka finnes i biblioteket
    Og at det finnes en låner

  Scenario:
  	Gitt at en bok er utlånt til en låner
  	Når boka blir registrert innlevert
  	Så viser systemet at låneren ikke låner boka