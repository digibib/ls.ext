# encoding: UTF-8
# language: no

Egenskap: Legg til låner
  Som en person
  For å kunne låne bøker i biblioteket
  Ønsker jeg å kunne registrere meg som låner

  @wip
  Scenario: Admin-bruker registrerer en ny låner
    Gitt at det finnes en admin-bruker
    Når Admin-bruker legger inn "Knut" som ny låner
    Så registrerer systemet at "Knut" er låner
    
