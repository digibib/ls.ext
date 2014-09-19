# encoding: UTF-8
# language: no

@wip
Egenskap: Selvbetjent innlevering
  Som en låner Knut
  For å unngå purregebyr fra biblioteket
  Ønsker jeg å levere tilbake filmen Ringenes herre

  Bakgrunn:
    Gitt at det finnes en låner
    Og at låneren ikke har aktiv innkrevingssak

  @wip
  Scenario: Låner forsøker å levere tilbake materiale med feil antall brikker på utlånsautomat
    Gitt at det finnes en utlånsautomat
    Og at låneren har materiale han vil levere inn
    Og at materialet ikke har riktig antall brikker
    Når låneren velger å levere inn på automaten
    Og låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke er komplett
    Og systemet viser at materialet fortsatt er utlånt til låner

  @wip
  Scenario: Låner leverer tilbake lånt materiale på utlånsautomat, materialet skal på hylla
    Gitt at det finnes en utlånsautomat
    Og at låneren har materiale han vil levere inn
    Og at materialet har riktig antall brikker
    Og at materialet ikke er reservert
    Og at materialet ikke tilhører annen avdeling
    Når låneren velger å levere inn på automaten
    Og låneren legger materialet på automaten
    Så får låneren beskjed om at materialet er innlevert
    Og låneren får beskjed om at materialet skal plasseres på hylle for innlevert materiale 
    Og systemet viser at låneren ikke låner materialet
    Og systemet viser at materialet ikke er utlånt

  @wip
  Scenario: Levert materiale skal på innlevert-hylle
    Gitt at låner har levert tilbake lånt materiale på utlånsautomat
    Og at materialet ikke er reservert til annen låner
    Og at at materialet ikke tilhører en annen avdeling
    Så får låner beskjed om at materialet skal plasseres på hylle for innlevert materiale

  @wip
  Scenario: Levert materiale er reservert
    Gitt at låner har levert tilbake lånt materiale på utlånsautomat
    Og at materialet er reservert til annen låner
    Og at at materialet ikke tilhører en annen avdeling
    Så får låner beskjed om at materialet skal plasseres på hylle for innlevert materiale