# encoding: UTF-8
# language: no

Egenskap: Bibliografiske poster via API
  Som superbruker
  For å finne relevant informasjon om bøker
  Ønsker jeg å kunne vise informasjon om eksemplarer og manifestasjoner

  Bakgrunn:
    Gitt at jeg er autentisert som superbruker via REST API

  Scenario: Vis eksemplarinfo for aktivt lån via API
    Gitt at det er registrert en låner via API
    Og at låneren har lånt en bok
    Når jeg sjekker lånerens aktive lån via API
    Og jeg slår opp eksemplaret via API
    Så vil systemet vise detaljert eksemplarinformasjon
