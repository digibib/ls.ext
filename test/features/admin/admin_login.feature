# encoding: UTF-8
# language: no

Egenskap: Autentisering av adminbruker i biblioteksystemet
  Som adminbruker
  For å kunne gjøre jobben min
  Ønsker jeg å kunne logge på biblioteksystemet

  Scenario: Pålogging for adminbruker i Koha
    Gitt at jeg er på Kohas interne forside
    Når jeg fyller inn credentials for en adminbruker og trykker Logg inn
    Så har jeg kommet til førstesiden til koha
    Så vises det at jeg er pålogget
