# encoding: UTF-8
# language: no

@issue-3
@wip
Egenskap: Selvbetjent utlån via utlånsautomat
  Som en låner Knut
  For å bli underholdt
  Ønsker jeg å låne filmen Ringenes herre

  Notat: Disse scenariene tester ikke egentlig automaten, men at dersom vi oppfører oss
  som en automat så svarer Koha på en forutsigelig måte som passer for våre automater
  etter at vi har lastet dem med riktig oppsett. Test med automat er manuell.

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | dateofbirth | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 01/01/2020 | 2010-01-01  | 0             | 0     | false    | 1234     | 0     |
    Og at låneren ikke har utestående purregebyr
    Og at låneren ikke har aktiv innkrevingssak
    Og at låneren ikke er fratatt lånerretten
    Gitt at låneren har identifisert seg for å låne på utlånsautomaten
    Og at låneren har materiale han ønsker å låne

  Scenario: Eksisterende låner forsøker å låne materiale med for høy aldersgrense
    Gitt at aldersgrensen på materialet er høyere enn lånerens alder
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke kan lånes pga aldersbegrensning
    Og systemet viser at materialet ikke er utlånt

  @wip @issue-11 @unstable
  Scenario: Eksisterende låner forsøker å låne materiale som ikke er til utlån
    Gitt at materialet ikke er til utlån
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke er til utlån
    Og systemet viser at materialet ikke er utlånt

  @wip @issue-11 @unstable
  Scenario: Eksisterende låner forsøker å låne materiale som er holdt av til annen låner
    Gitt at materialet er holdt av til en annen låner
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke kan lånes
    Og systemet viser at materialet fortsatt er holdt av til den andre låneren

  Scenario: Eksisterende låner med maks antall lån forsøker å låne materiale
    Gitt at låneren har et antall lån som ikke er under maksgrense for antall lån
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet overskrider maksgrensen for lån
    Og systemet viser at materialet ikke er utlånt

  @wip @issue-11 @unstable
  Scenario: Eksisterende låner låner materiale på automat
    Gitt at materialet har riktig antall RFID-brikker
    Og at materialet er til utlån
    Og at materialet ikke er holdt av til en annen låner
    Og at aldersgrensen på materialet ikke er høyere enn lånerens alder
    Og at låneren har et antall lån som er under maksgrense for antall lån
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet er registrert utlånt
    Og systemet viser at låneren låner materialet
    Og systemet viser at materialet er utlånt
    Og systemet viser at alarm er deaktivert

  # Det neste scenariet er ikke mulig å teste automatisk, logikken er i automaten.
  @ignore
  Scenario: Eksisterende låner forsøker å låne materiale med feil antall RFID-brikker
    Gitt at materialet ikke har riktig antall RFID-brikker
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke er komplett
    Og systemet viser at materialet ikke er utlånt
