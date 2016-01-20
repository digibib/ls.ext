# encoding: UTF-8
# language: no

Egenskap: Legge til utgivelsesautoriteter på utgivelse
  Som katalogisator
  For å gjøre det mulig for brukere å se utgivelsesinformasjon
  Ønsker jeg å legge til utgiver, utgivelsessted og serie med nummerering på utgivelser
  
  Scenario: Opprettelse av et utgivelsessted
    Når jeg vil lage et nytt utgivelsessted
    Så leverer systemet en ny ID for det nye utgivelsesstedet
    Og jeg kan legge inn stedsnavn og land
    Og grensesnittet viser at endringene er lagret

  @wip
  Scenario: Legge til utgivelsessted i arbeidsflyt
    Gitt at jeg har opprettet et utgivelsessted
    Og at jeg har opprettet en utgivelse i arbeidsflyten
    Når jeg skriver inn utgivelsessted i feltet for utgivelsessted og trykker enter
    Så søker jeg opp utgivelsessteder og kan velge den jeg vil ha
    Og utgivelsen er tilkoplet en utgivelsessted
  
  @wip
  Scenario: Opprettelse av utgiver
    Gitt at jeg er på utgiveropprettelsessida
    Når jeg fyller ut feltet for utgivernavn
    Så har jeg laget en ny utgiver

  @wip
  Scenario: Legge til utgiver på utgivelse
    Gitt at jeg har opprettet en utgiver
    Og at jeg har opprettet en utgivelse i arbeidsflyten
    Når jeg skriver inn utgivernavn i feltet for utgiver og trykker enter
    Så søker jeg opp utgiveren og kan velge den jeg vil ha
    Og utgivelsen er tilkoplet en utgiver

  @wip
  Scenario: Opprettelse av serie
    Gitt at jeg er på serieopprettelsessida
    Når jeg fyller ut feltet for serienavn
    Så har jeg laget en ny serie

  @wip
  Scenario: Legge til serie på utgivelse
    Gitt at jeg har opprettet en serie
    Og at jeg har opprettet en utgivelse i arbeidsflyten
    Når jeg skriver inn serienavn i feltet for serie og trykker enter
    Så søker jeg opp serien og kan velge den jeg vil ha
    Og utgivelsen er tilkoplet en serie

  