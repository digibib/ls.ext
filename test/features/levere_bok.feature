# encoding: UTF-8
# language: no

@wip
Egenskap: Innlevering av bok
  Som adminbruker
  For å betjene låneren Knut
  Ønsker jeg å registrere boka han har lånt som innlevert

Bakgrunn:
  Gitt at jeg er pålogget som adminbruker
  Og at Knut eksisterer som en låner
  Og at "Fargelegg byen!" er ei bok som finnes i biblioteket

  @wip
  Scenario:
  	Gitt at "Fargelegg byen!" er utlånt til "Knut"
  	Når "Fargelegg byen!" blir registrert innlevert
  	Så registrerer systemet at Knut ikke låner "Fargelegg byen!"