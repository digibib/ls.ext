# encoding: UTF-8
# language: no

Egenskap: Selvbetjent utlån via utlånsautomat
  Som en låner Knut
  For å bli underholdt
  Ønsker jeg å låne filmen Ringenes herre

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | dateofbirth | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 2010-01-01  | 0             | 0     |          | 1234     | 0     |
    Og at låneren ikke har utestående purregebyr
    Og at låneren ikke har aktiv innkrevingssak
    Og at låneren ikke er fratatt lånerretten
    Gitt at låneren har identifisert seg for å låne på utlånsautomaten
    Og at låneren har materiale han ønsker å låne

  @wip @ignore
  Scenario: Eksisterende låner forsøker å låne materiale med feil antall RFID-brikker
    Gitt at materialet ikke har riktig antall RFID-brikker
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke er komplett
    Og systemet viser at materialet ikke er utlånt

  Scenario: Eksisterende låner forsøker å låne materiale som ikke er til utlån
    Gitt at materialet ikke er til utlån
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke er til utlån
    Og systemet viser at materialet ikke er utlånt

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

  Scenario: Eksisterende låner forsøker å låne materiale med for høy aldersgrense
    Gitt at aldersgrensen på materialet er høyere enn lånerens alder
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke kan lånes pga aldersbegrensning
    Og systemet viser at materialet ikke er utlånt

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