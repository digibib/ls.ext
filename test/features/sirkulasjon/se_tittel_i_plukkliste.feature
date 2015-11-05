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

  Scenario: Sjekker plukkliste
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes et verk og en utgivelse
    Og jeg ser på utgivelsen i katalogiseringsgrensesnittet
    Og jeg følger lenken til posten i Koha
    Og jeg oppretter et eksemplar av utgivelsen
    Og at det finnes en reservasjon på materialet
    Så ser jeg tittelen i plukklisten