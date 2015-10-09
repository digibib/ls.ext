# encoding: UTF-8
# language: no

@wip @issue-4
Egenskap: Kvittering ved innlevering
  Som en låner Knut
  For å kunne dokumentere for meg selv og andre at jeg har levert lånt materiale
  Ønsker jeg kvittering når jeg har levert inn materiale på automat

  Notat: Disse scenariene tester ikke egentlig automaten, men at dersom vi oppfører oss
  som en automat så svarer Koha på en forutsigelig måte som passer for våre automater
  etter at vi har lastet dem med riktig oppsett. Test med automat er manuell.

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | password |
      | Knut      | 01/08/2015   | 01/01/2020 | 1234     |
    Og at låneren ikke har aktiv innkrevingssak
    Og at det finnes materiale som er utlånt til låneren
    Og at materialet har en eieravdeling
    Og at materialet har riktig antall RFID-brikker
    Og at det ikke finnes en reservasjon på materialet
    Og at materialets henteavdeling er lik den avdelingen der materialet blir levert
    Og innlevering blir valgt på automaten
    Og låneren legger materialet på automaten
    Og får låneren beskjed om at materialet er registrert levert
    Og det gis beskjed om at materialet skal settes på oppstillingshylle
    Og systemet viser at låneren ikke låner materialet
    Og systemet viser at alarm er aktivert

  Scenario: Kvittering på epost
    Når låneren velger kvittering på epost
    Så får han en epost med forfatter, tittel, tittel- og eksemplarnr, innleveringsdato, kontaktinfo for utlånsavdeling

  Scenario: Kvittering på utskrift
    Når låneren velger kvittering på papir
    Så får han en utskrift med forfatter, tittel, tittel- og eksemplarnr, innleveringsdato, kontaktinfo for utlånsavdeling
