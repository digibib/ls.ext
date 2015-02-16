# encoding: UTF-8
# language: no

@wip @ignore
Egenskap: Overføring til innleveringsboks ved selvbetjent innlevering
  Disse scenariene håndteres internt av automatenes software
  Lar seg derfor ikke teste mot Koha og SIP2

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | password |
      | Knut      | 01/08/2015   | 10/08/2015 | 1234     |
    Og at låneren ikke har aktiv innkrevingssak
    Og at det finnes materiale som er utlånt til låneren
    Og at materialet har en eieravdeling

  @wip @ignore
  Scenario: Innleveringsboks får feil materiale
    Gitt at noen har forsøkt å levere lånt materiale på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Når annet materiale blir lagt i innleveringsboks
    Så det gis beskjed om at feil materiale er lagt i innleveringsboks
    Og systemet viser at det lånte materialet fortsatt er utlånt til låner

  @wip @ignore
  Scenario: Innleveringsboks får ukomplett materiale
    Gitt at noen har forsøkt å levere lånt materiale på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Når lånt materiale blir lagt i innleveringsboks
    Og innleveringsboks registrerer at materialet har feil antall RFID-brikker
    Så det gis beskjed om at materialet ikke er komplett
    Og systemet viser at det lånte materialet fortsatt er utlånt til låner

  @wip @ignore
  Scenario: Innleveringsboks får materiale som tilhører annen avdeling
    Gitt at noen har forsøkt å levere lånt materiale som tilhører annen avdeling på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Og at materialet har riktig antall RFID-brikker
    Når lånt materiale blir lagt i innleveringsboks
    Så tar innleveringsboks imot materialet
    Og det gis beskjed om at materialet er innlevert
    Og systemet viser at materialet skal returneres til eieravdeling
    Og systemet viser at låneren ikke låner materialet

  @wip @ignore
  Scenario: Innleveringsboks får materiale som er reservert
    Gitt at noen har forsøkt å levere lånt materiale som er reservert på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Og at materialet har riktig antall RFID-brikker
    Når lånt materiale blir lagt i innleveringsboks
    Så tar innleveringsboks imot materialet
    Og det gis beskjed om at materialet er innlevert
    Og systemet viser at materialet skal til henteavdeling
    Og systemet viser at låneren ikke låner materialet

  @wip @ignore
  Scenario: Noen forsøker å levere tilbake materiale med feil antall brikker på utlånsautomat
    Gitt at materialet ikke har riktig antall RFID-brikker
    Når innlevering blir valgt på automaten
    Og materialet blir lagt på automaten
    Så gis det beskjed om at materialet ikke er komplett
    Og systemet viser at materialet fortsatt er utlånt til låner
