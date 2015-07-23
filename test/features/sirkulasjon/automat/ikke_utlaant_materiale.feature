# encoding: UTF-8
# language: no

@issue-8 @bug-13411
Egenskap: Innlevering av ikke-utlånt materiale

  Notat: Disse scenariene tester ikke egentlig automaten, men at dersom vi oppfører oss
  som en automat så svarer Koha på en forutsigelig måte som passer for våre automater
  etter at vi har lastet dem med riktig oppsett. Test med automat er manuell.

  OBS! Låner forsøker å levere materiell som er reservert på samme avdeling tester for CV = 02 (hold for other branch)
  Denne skulle vært CV = 01 (hold for same branch) ifølge SIP3 spec?

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | dateofbirth | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 2010-01-01  | 0             | 0     | false    | 1234     | 0     |
    Og innlevering blir valgt på automaten
    Og at låneren har materiale han ønsker å levere
    Og at materialet ikke er lånt ut til låner


  Scenario: Låner forsøker å levere materiale som ikke er lånt ut
    Og at materialet ikke er holdt av til en annen låner
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet er registrert levert

  @wip @issue-11 @unstable
  Scenario: Låner forsøker å levere materiell som er reservert på samme avdeling
    Gitt at materialet har riktig antall RFID-brikker
    Og at det finnes en reservasjon på materialet
    Og låneren legger materialet på automaten
    Så registrerer automaten at materialet er reservert på samme avdeling
    Og får låneren beskjed om at materialet er registrert levert
    Og det gis beskjed om at materialet skal legges i innleveringsboks

  @wip @issue-11 @unstable
  Scenario: Låner forsøker å levere materiell som er reservert på annen avdeling
    Gitt at materialet har riktig antall RFID-brikker
    Og at det finnes en reservasjon på en annen avdeling
    Og låneren legger materialet på automaten
    Så registrerer automaten at materialet er reservert på annen avdeling
    Og får låneren beskjed om at materialet er registrert levert
    Og det gis beskjed om at materialet skal legges i innleveringsboks

