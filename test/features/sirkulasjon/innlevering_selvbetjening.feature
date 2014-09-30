# encoding: UTF-8
# language: no

@wip
Egenskap: Selvbetjent innlevering
  Som en låner Knut
  Fordi jeg har sett filmen jeg lånte
  Ønsker jeg å levere den tilbake til biblioteket

  Bakgrunn:
    Gitt at det finnes en låner
    Og at låneren ikke har aktiv innkrevingssak
    Og at det finnes materiale som er utlånt til låneren
    Og at materialet har en eieravdeling
    Og at det finnes en utlånsautomat

  @wip
  Scenario: Noen forsøker å levere tilbake materiale med feil antall brikker på utlånsautomat
    Gitt at materialet som forsøkes innlevert ikke har riktig antall brikker
    Når innlevering blir valgt på automaten
    Og materialet blir lagt på automaten
    Så gis det beskjed om at materialet ikke er komplett
    Og systemet viser at materialet fortsatt er utlånt til låner

  @wip
  Scenario: Noen forsøker å levere tilbake lånt materiale på utlånsautomat
    Gitt at materialet har riktig antall brikker
    Og at det ikke finnes en reservasjon på materialet
    Og at materialets henteavdeling er lik den avdelingen der materialet blir levert
    Når innlevering blir valgt på automaten
    Og materialet blir lagt på automaten
    Så gis det beskjed om at materialet er levert
    Og det gis beskjed om at materialet skal settes på oppstillingshylle
    Og systemet viser at materialet ikke er levert til låner

  @wip
  Scenario: Noen forsøker å levere tilbake lånt materiale som tilhører annen avdeling på utlånsautomat
    Gitt at materialet har riktig antall brikker
    Og at det ikke finnes en reservasjon på materialet
    Og at materialets eieravdeling er forskjellig fra avdelingen der materialet blir levert
    Når innlevering blir valgt på automaten
    Og materialet blir lagt på automaten
    Så gis det beskjed om at materialet skal legges i innleveringsboks

  @wip
  Scenario: Noen forsøker å levere tilbake lånt materiale som er reservert på utlånsautomat
    Gitt at materialet har riktig antall brikker
    Og at det finnes en reservasjon på materialet
    Når innlevering blir valgt på automaten
    Og materialet blir lagt på automaten
    Så gis det beskjed om at materialet skal legges i innleveringsboks

  @wip
  Scenario: Innleveringsboks får feil materiale
    Gitt at noen har forsøkt å levere lånt materiale på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Når annet materiale blir lagt i innleveringsboks
    Så gis det beskjed om at feil materiale er lagt i innleveringsboks
    Og systemet viser at det lånte materialet fortsatt er utlånt til låner

  @wip
  Scenario: Innleveringsboks får ukomplett materiale
    Gitt at noen har forsøkt å levere lånt materiale på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Når lånt materiale blir lagt i innleveringsboks
    Og innleveringsboks registrerer at materialet har feil antall RFID-brikker
    Så gis det beskjed om at materialet ikke er komplett
    Og systemet viser at det lånte materialet fortsatt er utlånt til låner

  @wip
  Scenario: Innleveringsboks får materiale som tilhører annen avdeling
    Gitt at noen har forsøkt å levere lånt materiale som tilhører annen avdeling på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Og at materialet har riktig antall RFID-brikker
    Når lånt materiale blir lagt i innleveringsboks
    Så tar innleveringsboks imot materialet
    Og det gis beskjed om at materialet er innlevert
    Og systemet viser at materialet skal returneres til eieravdeling
    Og systemet viser at materialet ikke er utlånt til låner

  @wip
  Scenario: Innleveringsboks får materiale som er reservert
    Gitt at noen har forsøkt å levere lånt materiale som er reservert på utlånsautomat
    Og at det er gitt beskjed om at materialet skal legges i innleveringsboks
    Og at materialet har riktig antall RFID-brikker
    Når lånt materiale blir lagt i innleveringsboks
    Så tar innleveringsboks imot materialet
    Og det gis beskjed om at materialet er innlevert
    Og systemet viser at materialet skal til henteavdeling
    Og systemet viser at materialet ikke er utlånt til låner