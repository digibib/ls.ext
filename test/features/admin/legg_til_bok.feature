# encoding: UTF-8
# language: no

Egenskap: Legg til bok
  Som admin-bruker
  For å kunne låne ut bøker
  Ønsker jeg å kunne legge til en bok i systemet

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  Scenario: Admin legger til ny bok
    Gitt at det finnes en materialtype
    Og at det finnes en avdeling
    Når jeg legger inn boka som en ny bok
    Så viser systemet at boka er en bok som kan lånes ut
