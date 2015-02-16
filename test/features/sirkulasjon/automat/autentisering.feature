# encoding: UTF-8
# language: no

@issue-3
Egenskap: Autentisering på automat
  Som en låner Knut
  Fordi jeg liker å gjøre ting selv
  Ønsker jeg å bruke en selvbetjent automat

  Notat: Disse scenariene tester ikke egentlig automaten, men at dersom vi oppfører oss
  som en automat så svarer Koha på en forutsigelig måte som passer for våre automater
  etter at vi har lastet dem med riktig oppsett. Test med automat er manuell.

  Bakgrunn:
    Gitt at det finnes en utlånsautomat

  Scenario: Autentisering av eksisterende låner for utlån på automat
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 0             | 0     | false    | 1234     | 0     |
    Og at låneren ikke har utestående purregebyr
    Og at låneren ikke har aktiv innkrevingssak
    Og at låneren ikke er fratatt lånerretten
    Når låneren velger "låne" på automaten
    Og låneren identifiserer seg på automat med riktig PIN
    Så får låneren mulighet til å registrere lån på automaten

  Scenario: Låner prøver å låne på automat med feil PIN
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 0             | 0     | false    | 1234     | 0     |
    Når låneren velger "låne" på automaten
    Og låneren identifiserer seg på automat med feil PIN
    Så får låneren beskjed om at PIN ikke er riktig

  Scenario: Låner med lånekort rapportert mistet prøver å låne på automat
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 0             | 1     | false    | 1234     | 0     |
    Når låneren velger "låne" på automaten
    Og låneren identifiserer seg på automat med riktig PIN
    Så får låneren beskjed om at lånekort er sperret

  Scenario: Låner registrert med feil adresse prøver å låne på automat
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 1             | 0     | false    | 1234     | 0     |
    Når låneren velger "låne" på automaten
    Og låneren identifiserer seg på automat med riktig PIN
    Så får låneren beskjed om at lånekort er sperret

  Scenario: Låner registrert med sperret kort prøver å låne på automat
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred   | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 0             | 0     | 2015-10-10 | 1234     | 0     |
    Når låneren velger "låne" på automaten
    Og låneren identifiserer seg på automat med riktig PIN
    Så får låneren beskjed om at lånekort er sperret

  Scenario: Låner prøver å låne på automat med kort som har utløpt
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred   | password | flags |
      | Knut      | 01/08/2015   | 01/07/2015 | 0             | 0     | 0          | 1234     | 0     |
    Når låneren velger "låne" på automaten
    Og låneren identifiserer seg på automat med riktig PIN
    Så får låneren beskjed om at lånekort er sperret
