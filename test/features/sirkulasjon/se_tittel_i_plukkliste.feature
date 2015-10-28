# encoding: UTF-8
# language: no

Egenskap: Se tittel i plukkliste
  Som bibliotekar
  For at jeg skal kunne vite hvilke bøker jeg skal hente
  Må plukklisten inneholde tittel

  Scenario: Finn utgivelsestittel i Koha
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes et verk og en utgivelse
    Når jeg besøker bokposten
    Så ser jeg tittelen i bokposten

  @wip
  Scenario: Sjekker plukkliste
    Gitt at det finnes et verk og en utgivelse
    Og jeg leter opp boka i katalogiseringssøk
    Så ser jeg tittelen i plukklisten