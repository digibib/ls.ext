# encoding: UTF-8
# language: no

Egenskap: Legge til autoriteter på verk
  Som katalogisator
  For å gjøre det mulig for brukere å se og søke opp emner og sjangre på verk
  Ønsker jeg å legge til emner og sjangre på verk

  @wip
  Scenario: Opprettelse av emne
    Når jeg vil lage et nytt emne
    Så leverer systemet en ny ID for det nye emnet
    Og jeg kan legge inn emnenavn
    Og grensesnittet viser at endringene er lagret

  @wip
  Scenario: Legge til emne i arbeidsflyt
    Gitt at jeg har opprettet et emne
    Og at jeg har opprettet et verk i arbeidsflyten
    Når jeg skriver inn emne i feltet for emne og trykker enter
    Så søker jeg opp emner og kan velge det jeg vil ha
    Og verket er tilkoplet et emne

  @wip
  Scenario: Opprettelse av sjanger
    Gitt at jeg er på sjangeropprettelsessida
    Når jeg fyller ut feltet for sjangernavn
    Så har jeg laget en ny sjanger

  @wip
  Scenario: Legge til sjanger på verk
    Gitt at jeg har opprettet en sjanger
    Og at jeg har opprettet et verk i arbeidsflyten
    Når jeg skriver inn sjangernavn i feltet for sjanger og trykker enter
    Så søker jeg opp sjangeren og kan velge den jeg vil ha
    Og verket er tilkoplet en sjanger
