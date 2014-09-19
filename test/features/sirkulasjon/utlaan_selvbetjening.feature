# encoding: UTF-8
# language: no

@wip
Egenskap: Selvbetjent utlån av bok
  Som en låner Knut
  For å kunne lære om Oslo kommunes utsmykkinger
  Ønsker jeg å kunne låne boken Fargelegg byen!
  
  Bakgrunn:
    Gitt at det finnes en låner

  @wip
  Scenario: Autentisering av eksisterende låner for utlån på automat
    Gitt at det finnes en utlånsautomat
    Når låneren velger å låne på automaten
    Og låner identifiserer seg med lånekort og PIN
    Så får låneren mulighet til å registrere lån på automaten

  @wip
  Scenario: Eksisterende låner låner bok på automat
    Gitt at låneren har identifisert seg for å låne på utlånsautomaten
    Og at låneren har en bok
    Og at boka har en RFID-brikke
    Når låneren legger boka på automaten
    Så registrerer systemet at låneren låner boka
    Og at boka er utlånt