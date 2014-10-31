# encoding: UTF-8
# language: no

@wip
Egenskap: Sjekke at lånere har riktige tilganger
  Som adminbruker
  For å sikre at låner har nødvendige tilganger
  Gitt en overordnet forståelse av tilgjenglig informasjon i form av lånerkategori, rettigheter i systemet og eventuelle meldinger i meldingsfeltet
  Ønsker jeg å sjekke at låneren har tilgangene de skal ha

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  @wip
  Scenario: Testing av låners tilganger
    Gitt at låneren er registrert i systemet
    Når jeg søker opp låneren og velger deres side
    Hvis låneren skal ha forventet tilgang <tilgang>
    Så er lånerens tilgangsnivå <nivå>
    
    Examples:
    | tilgang | kategori | melding    | nivå            |
    | ingen   | B        | ikke       | borrow under 15 |
    | opac    | V        |            | borrow          |
    | ingen   | stl      | tyveri     | banned          |
    | ingen   | bvb22    | purregebyr | borrow          |
    | etc     | etc      | etc        | etc             |