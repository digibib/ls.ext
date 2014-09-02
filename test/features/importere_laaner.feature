# encoding: UTF-8
# language: no

@wip
Egenskap: Import av låner
  Som låner, registrert i gammelt system
  For å kunne låne bøker fra Hjørnebiblioteket
  Ønsker jeg å bli låner hos Hjørnebiblioteket

  Scenario:
    Gitt at det finnes data som beskriver en låner "Kari"
    Og at "Kari" ikke finnes som låner
    Når dataene importeres til systemet
    Så registrerer systemet at "Kari" er låner