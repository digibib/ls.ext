# encoding: UTF-8
# language: no

Egenskap: Legg til bok
  Som admin-bruker
  For å kunne låne ut bøker
  Ønsker jeg å kunne legg til en bok i systemet

  @wip
  Scenario: Admin legger til ny bok
    Gitt at det finnes en admin-bruker
    Når Admin-bruker legger inn "Fargelegg byen!" som ny bok
    Så registrerer systemet at "Fargelegg byen!" er en bok som kan lånes ut
