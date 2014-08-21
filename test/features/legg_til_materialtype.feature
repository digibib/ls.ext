# encoding: UTF-8
# language: no

Egenskap: Legg til materialtype
  Som katalogisator
  For å registrere en ny bok
  Trenger jeg en materialtype for bøker

  @itemTypeCreated
  Scenario: Legge til materialtype via webgrensesnitt
    Gitt at jeg er pålogget som adminbruker
    Når jeg legger til en materialtype "Bok" med kode "L"
    Så kan jeg se materialtypen i listen over materialtyper
