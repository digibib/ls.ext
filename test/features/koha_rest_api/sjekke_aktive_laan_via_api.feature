# encoding: UTF-8
# language: no

Egenskap: Sjekke aktive lån via API
  Som låner
  Siden jeg ønsker å ha oversikt
  Ønsker jeg å kunne se hvilke bøker jeg har lånt

Bakgrunn:
  Gitt at jeg er autentisert som superbruker via REST API
  Og at det er registrert en låner via API

  Scenario: List aktive lån via API
    Gitt at låneren har lånt en bok
    Når jeg sjekker lånerens aktive lån via API
    Så finnes boka i listen over aktive lån fra APIet
