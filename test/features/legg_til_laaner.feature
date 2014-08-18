# encoding: UTF-8
# language: no

Egenskap: Legg til låner
  Som en person
  For å kunne låne bøker i biblioteket
  Ønsker jeg å kunne registrere meg som låner

  @wip
  Scenario: Admin-bruker registrerer en ny låner
    Gitt at jeg er pålogget som adminbruker
    Når jeg legger inn "Knut" som ny låner
    Så viser systemet at "Knut" er låner
