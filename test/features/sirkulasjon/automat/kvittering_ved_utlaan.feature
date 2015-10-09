# encoding: UTF-8
# language: no

@wip @issue-4
Egenskap: Kvittering ved utlån
  Som en låner Knut
  For å få oversikt over hva som er lånt og returdatoer
  Ønsker jeg kvittering når jeg har lånt materiale på automat

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
    Og at låneren har materiale han ønsker å låne
    Og at låneren har identifisert seg for å låne på utlånsautomaten
    Og låneren legger materialet på automaten
    Og får låneren beskjed om at materialet er registrert utlånt

  Scenario: Kvittering på epost
    Når låneren velger kvittering på epost
    Så får han en epost med forfatter, tittel, tittel- og eksemplarnr, utlånsdato, kontaktinfo for utlånsavdeling

  Scenario: Kvittering på utskrift
    Når låneren velger kvittering på papir
    Så får han en utskrift med forfatter, tittel, tittel- og eksemplarnr, utlånsdato, kontaktinfo for utlånsavdeling

