# encoding: UTF-8
# language: no
@wip
Egenskap: Legg til bok
  Som admin-bruker
  For å kunne låne ut bøker
  Ønsker jeg å kunne legg til en bok i systemet

  @wip
  Scenario: Admin legger til ny bok
    Gitt at jeg er pålogget som adminbruker
    Når jeg legger inn "Fargelegg byen!" som ny bok
    Så viser systemet at "Fargelegg byen!" er en bok som kan lånes ut
