# encoding: UTF-8
# language: no

Egenskap: Legge til avdeling
  Som adminbruker
  Ønsker jeg å kunne legge til en avdeling

  @wip
  Scenario: Ny avdeling i biblioteksystemet
    Gitt at jeg er pålogget som adminbruker
    Når jeg legger inn "Hjørnebiblioteket" som ny avdeling
    Så finnes "Hjørnebiblioteket" i oversikten over avdelinger
