# encoding: UTF-8
# language: no

Egenskap: Se tittel i plukkliste
  Som bibliotekar
  For at jeg skal kunne vite hvilke bøker jeg skal hente
  Må plukklisten inneholde tittel

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at jeg er i katalogiseringsgrensesnittet

  @wip
  Scenario: Finn utgivelsestittel i Koha
    Gitt at det finnes et verk med person og en utgivelse
    Når jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Og ser jeg forfatteren i bokposten

  Scenario: Sjekker plukkliste
    Gitt at det finnes et verk med person og en utgivelse
    Og jeg ser på utgivelsen i katalogiseringsgrensesnittet
    Og jeg følger lenken til posten i Koha
    Og jeg oppretter et eksemplar av utgivelsen
    Og at det finnes en reservasjon på materialet
    Så ser jeg tittelen i plukklisten
    Og ser jeg forfatteren i plukklisten

  Scenario: Finn endret utgivelsestittel i Koha
    Gitt at det finnes et verk med person og en utgivelse
    Og jeg besøker bokposten
    Når jeg åpner utgivelsen for redigering
    Og når jeg endrer tittelen på utgivelsen
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten