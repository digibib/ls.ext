# encoding: UTF-8
# language: no

Egenskap: Legg til bruker
  Som en person
  For å kunne låne bøker i biblioteket
  Ønsker jeg å kunne registrere meg som bruker

  @wip
  Scenario: Admin-bruker registrerer en ny bruker
    Gitt at det finnes en admin-bruker
    Når Admin-bruker legger inn "Knut" som ny bruker
    Så registrerer systemet at "Knut" er bruker
    
