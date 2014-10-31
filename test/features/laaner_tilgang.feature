# encoding: UTF-8
# language: no

@wip
Egenskap: Sjekke at lånere har riktige tilganger
  Som adminbruker
  For å sikre at låner har nødvendige tilganger
  Gitt en overordnet forståelse av tilgjenglig informasjon i form av lånerkategori, rettigheter i systemet og eventuelle meldinger i meldingsfelt
  Ønsker jeg å sjekke at låneren har tilgangene de skal ha
  
  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og gitt følgende data
    | tilgang | kategori | melding       | nivå              |
    | ingen   | B        | mistet nøkkel | borrow under 15   |
    | opac    | V        |               | borrow            |
    | ingen   | stl      | tyveri        | banned            |
    | ingen   | bvb22    | sen betlaing  | banned until date |
    | etc     | etc      | etc           | etc               |

  Scenario: Testing av låners tilganger
    Gitt at låneren er registrert i systemet
    Når jeg søker opp låneren og velger deres side
    Så har låneren forventet tilgang
    Og lånerens tilgangsnivå er som forventet