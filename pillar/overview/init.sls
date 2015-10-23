---
overview:
  saltfiles: salt://overview/files
  binding: 0.0.0.0
  koha:
    opac:
      description: Kohas standard grensesnitt for brukeren. Tilbyr mappami-funksjonalitet og søk/reservering. Vil ikke bli brukt i LS.ext.
      examples: ''
    intra:
      description: Kohas intranett. Katalogisering, brukerhåndtering, utlån/innlevering, osv.
      examples: ''
    plack:
      description: Kohas intranett på steroider. Kan være ustabilt.
      examples: ''
  patron-client:
    description: LS.ext lånergrensesnitt
    examples: Søk på enkeltord i tittel eller personer
  catalinker:
    description: Katalogiseringsverktøy
    examples:
      - /person
      - /publication
      - /work
  kibana:
    description: Felles loggverktøy for feilsøking.
    examples: ''
  graphite:
    description: Monitorering av ytelse RAM/load/disk
    examples: ''
  dockerui:
    description: Grafisk håndtering av dockercontainere
    examples: ''
  services:
    description: API for LS.ext som håndterer dataflyt mellom RDF, Koha og presentasjonslag.
    examples:
      - /work/w1029812245
      - /publication/p2135235089
  fuseki:
    description: RDF-endpoint
    examples: ''
  elasticsearch:
    description: Indekseringsmotor
    examples: ''