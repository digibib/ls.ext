# encoding: UTF-8
# language: no

@wip
Egenskap: Legg til autorisert verdi
  Som katalogisator
  For å endre endre tilgjengelighet på eksemplarer
  Trenger jeg eksemplarstatus for bøker

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  Scenario: Legge til autorisert verdi via webgrensesnitt
    Når jeg legger til en autorisert verdi
    Så kan jeg finne den autoriserte verdien i listen over autoriserte verdier
