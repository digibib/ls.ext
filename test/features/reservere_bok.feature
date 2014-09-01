# encoding: UTF-8
# language: no

@wip
Egenskap: Reservering av bok
  Som låner
  For å lære om Oslo kommunes utsmykkinger
  Ønsker jeg å reservere boka "Fargelegg byen!"

Bakgrunn:
  Gitt at Knut er pålogget som låner
  Og at "Fargelegg byen!" er ei bok som finnes i biblioteket

  @wip
  Scenario:
    Gitt at "Knut" er pålogget som låner
    Og at "Knut" har funnet "Fargelegg byen!"
  	Når "Knut" reserverer "Fargelegg byen!"
    Så registrerer systemet at "Fargelegg byen!" er reservert av "Knut"