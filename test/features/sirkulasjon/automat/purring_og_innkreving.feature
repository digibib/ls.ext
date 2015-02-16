# encoding: UTF-8
# language: no

@wip
Egenskap: Purring og innkreving automat
  Som en låner Knut
  For å bli underholdt
  Ønsker jeg å låne filmen Ringenes herre

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | dateofbirth | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 2010-01-01  | 0             | 0     |          | 1234     | 0     |

  @wip
  Scenario: Låner med aktiv innkrevingssak forsøker å identifisere seg på automat
    Gitt at låneren har identifisert seg for å låne på utlånsautomaten
    Når låneren har aktiv innkrevingssak
    Så får låneren beskjed om å ta kontakt med betjeningen

  @wip
  Scenario: Låner med purregebyr forsøker å låne på automat
    Gitt at låneren har identifisert seg for å låne på utlånsautomaten
    Og at låneren har materiale han ønsker å låne
    Og at låneren har utestående purregebyr
    Når låneren legger materialet på automaten
    Så får låneren beskjed om å ta kontakt med betjeningen
    Og systemet viser at materialet ikke er utlånt

  @wip
  Scenario: Låner forsøker å levere materiale som ikke er lånt ut
    Gitt at låneren har valgt "levere" på utlånsautomaten
    Og at låneren har materiale han ønsker å levere
    Og at materialet ikke er holdt av til en annen låner
    Og at materialet ikke er lånt ut til låner
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke kan leveres
