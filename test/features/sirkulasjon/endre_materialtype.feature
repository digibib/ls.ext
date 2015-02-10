# encoding: UTF-8
# language: no

Egenskap: Endring av materialtyper
  Som adminbruker
  Ønsker jeg å endre materialtyper på ting

  Scenariet under tester ikkje for alle materialtyper, kun stikkprøver

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

    Abstrakt Scenario: Endre materialtype
      Gitt at tingen finnes i biblioteket
      Når jeg leter opp en ting i katalogiseringssøk
      Så kan jeg velge å endre materialtypen til "<Type>"
      Eksempler:
      | Type                                                  |
      | Artikler (i periodika eller bøker)                    |
      | Bok                                                   |
      | Dataspill - Xbox 360                                  |
      | Elektroniske ressurser - Blue-ray-ROM                 |
      | Film og video - videokassett - for døve               |
      | Utkånstidskrift                                       |