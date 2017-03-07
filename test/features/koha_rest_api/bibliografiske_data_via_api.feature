# encoding: UTF-8
# language: no

Egenskap: Bibliografiske poster via API
  Som superbruker
  For å finne relevant informasjon om bøker
  Ønsker jeg å kunne vise informasjon om eksemplarer og manifestasjoner

  @kohadb
  Scenario: Vis eksemplarinfo for aktivt lån via API
    Gitt at Koha er populert med 1 lånere, 1 eksemplarer og 0 reserveringer
    Og jeg låner ut boka
    Når jeg sjekker lånerens aktive lån via API
    Og jeg slår opp eksemplaret via API
    Så vil systemet vise detaljert eksemplarinformasjon

  Scenario: Legg til utgivelse via Kohas API
    Gitt at jeg er autentisert som superbruker via REST API
    Og at det finnes informasjon om en bok med eksemplarer
    Når jeg legger inn boka via Kohas API
    Så kan jeg følge lenken og finne den bibliografiske posten
