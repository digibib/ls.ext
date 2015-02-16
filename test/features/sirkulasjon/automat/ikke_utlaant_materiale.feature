# encoding: UTF-8
# language: no

@ignore @issue-8 @bug-13411
Egenskap: Innlevering av ikke-utlånt materiale

  Notat: Disse scenariene tester ikke egentlig automaten, men at dersom vi oppfører oss
  som en automat så svarer Koha på en forutsigelig måte som passer for våre automater
  etter at vi har lastet dem med riktig oppsett. Test med automat er manuell.

  OBS! Denne henger på en sak i Koha så vi @ignore'er inntil videre.

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | dateofbirth | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 2010-01-01  | 0             | 0     |          | 1234     | 0     |

  @ignore
  Scenario: Låner forsøker å levere materiale som ikke er lånt ut
    Gitt at låneren har valgt "levere" på utlånsautomaten
    Og at låneren har materiale han ønsker å levere
    Og at materialet ikke er holdt av til en annen låner
    Og at materialet ikke er lånt ut til låner
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke kan leveres
