# encoding: UTF-8
# language: no

@wip
Egenskap: Selvbetjent utlån av bok
  Som en låner Knut
  For å kunne lære om Oslo kommunes utsmykkinger
  Ønsker jeg å kunne låne boken Fargelegg byen!
  
  Bakgrunn:
    Gitt at det finnes en låner
    Og at låneren ikke har utestående purregebyr
    Og at låneren ikke har aktiv innkrevingssak
    Og at låneren ikke er fratatt lånerretten

  @wip
  Scenario: Autentisering av eksisterende låner for utlån på automat
    Gitt at det finnes en utlånsautomat
    Når låneren velger å låne på automaten
    Og låner identifiserer seg med gydlig lånekort
    Og låner taster riktig PIN
    Så får låneren mulighet til å registrere lån på automaten

  @wip
  Scenario: Eksisterende låner låner bok på automat
    Gitt at låneren har identifisert seg for å låne på utlånsautomaten
    Og at låneren har en bok
    Og at boka har riktig antall RFID-brikker
    Og at boka er til utlån
    Og at boka ikke er holdt av til en annen låner
    Og at låneren ikke overskrider maksgrense for antall lån
    Og at boka ikke har aldersgrense høyere enn lånerens alder
    Når låneren legger boka på automaten
    Så registrerer systemet at låneren låner boka
    Og at boka er utlånt
    Og at alarm er deaktivert