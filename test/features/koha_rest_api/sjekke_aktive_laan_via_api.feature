# encoding: UTF-8
# language: no

Egenskap: Sjekke aktive lån via API
  Som låner
  Siden jeg ønsker å ha oversikt
  Ønsker jeg å kunne se hvilke bøker jeg har lånt

  @kohadb
  Scenario: List aktive lån via API
    Gitt at jeg er logget inn som superbruker
    Og at Koha er populert med "1" lånere, "1" eksemplarer og "0" reserveringer
    Når jeg går til lånerens side i Koha
    Og jeg registrerer utlån av boka
    Når jeg sjekker lånerens aktive lån via API
    Så finnes boka i listen over aktive lån fra APIet
