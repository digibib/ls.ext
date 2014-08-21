# encoding: UTF-8
# language: no

Egenskap: Legg til låner
  Som en person
  For å kunne låne bøker i biblioteket
  Ønsker jeg å kunne registrere meg som låner

  @libraryCreated @userCreated @admin_logged_in
  Scenario: Admin-bruker registrerer en ny låner
    Og at det finnes en avdeling
    Og at det finnes en lånerkategori
    Når jeg legger inn "Knut" som ny låner
    Så viser systemet at "Knut" er låner
