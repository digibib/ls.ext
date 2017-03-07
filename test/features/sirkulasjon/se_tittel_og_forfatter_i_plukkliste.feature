# encoding: UTF-8
# language: no

@redef
@check-for-errors

Egenskap: Se tittel og forfatter i plukkliste
  Som bibliotekar
  For at jeg skal kunne vite hvilke bøker jeg skal hente
  Må plukklisten inneholde tittel og forfatter

  Bakgrunn:
    Gitt at det finnes 1 verk med 1 utgivelser og 1 personer
    Og at jeg er logget inn som superbruker

  Scenario: Finn utgivelsestittel og forfatter i Koha
    Når jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Og ser jeg forfatteren i bokposten

  Scenario: Finn endret utgivelsestittel i Koha
    Når jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Og når jeg endrer tittelen på utgivelsen
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten

  Scenario: Finn byttet forfatter i Koha
    Når jeg besøker bokposten
    Så ser jeg forfatteren i bokposten
    Og jeg endrer forfatteren på verket
    Og jeg besøker bokposten
    Så ser jeg forfatteren i bokposten

  Scenario: Finn forfatter med endret navn i Koha
    Når jeg besøker bokposten
    Så ser jeg forfatteren i bokposten
    Når jeg endrer navnet på personen
    Og jeg besøker bokposten
    Så ser jeg forfatteren i bokposten

  @kohadb
  Scenario: Sjekker plukkliste
    Og at Koha er populert med 1 lånere, 0 eksemplarer og 0 reserveringer
    Når jeg besøker bokposten
    Og jeg oppretter et eksemplar av utgivelsen
    Gitt at det finnes en reservasjon på materialet
    Når reserveringskøen kjøres
    Så ser jeg tittelen i plukklisten
    Og ser jeg forfatteren i plukklisten