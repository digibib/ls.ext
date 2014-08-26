# encoding: UTF-8
# language: no

Egenskap: Finn bok
  Som adminbruker
  Ønsker jeg å kunne finne en bok i systemet

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  @bookCreated @libraryCreated @itemTypeCreated
  Scenario: Admin-bruker finner en bok
    Gitt at det finnes en bok
    Så kan jeg søke opp boka