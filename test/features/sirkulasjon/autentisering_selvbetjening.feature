# encoding: UTF-8
# language: no

Egenskap: Autentisering på automat
  Som en låner Knut
  Fordi jeg liker å gjøre ting selv
  Ønsker jeg å bruke en selvbetjent automat
  
  Bakgrunn:
    Gitt at det finnes en utlånsautomat

  Scenario: Autentisering av eksisterende låner for utlån på automat
    Gitt at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | false         | false | false    | 1234     | 0     |
    Og at låneren ikke har utestående purregebyr
    Og at låneren ikke har aktiv innkrevingssak
    Og at låneren ikke er fratatt lånerretten
    Når låneren velger å låne på automaten
    Og låneren identifiserer seg på automat med riktig PIN på gyldig dato
    Så får låneren mulighet til å registrere lån på automaten

  @wip
  Scenario: Låner uten gyldig lånekort prøver å låne på automat
    Gitt at det finnes en låner med lånekort
      | registreringsdato | utløpsdato | dato       | pin  | input_pin |
      | 01/08/2015        | 10/08/2015 | 12/08/2015 | 1234 | 1234      |
    Så får låneren beskjed om at lånekort ikke er gyldig

  @wip
  Scenario: Låner prøver å låne på automat med feil PIN
    Gitt at det finnes en låner med lånekort
      | registreringsdato | utløpsdato | dato       | pin  | input_pin |
      | 01/08/2015        | 10/08/2015 | 02/08/2015 | 1234 | 9999      |
    Så får låneren beskjed om at PIN ikke er riktig
