---
overview:
  saltfiles: salt://overview/files
  binding: 0.0.0.0
  koha:
    opac:
      description: Kohas standard grensesnitt for brukeren. Tilbyr mappami-funksjonalitet og s&oslash;k/reservering. Vil ikke bli brukt i LS.ext.
      examples: ''
    intra:
      description: Kohas intranett. Katalogisering, brukerh&aring;ndtering, utl&aring;n/innlevering, osv.
      examples: ''
    plack:
      description: Kohas intranett p&aring; steroider. Kan v&aelig;re ustabilt.
      examples: ''
  patron-client:
    description: LS.ext l&aring;nergrensesnitt
    examples: S&oslash;k p&aring; enkeltord i tittel eller personer
  catalinker:
    description: Katalogiseringsverkt&oslash;y
    examples:
      - /person
      - /publication
      - /work
  kibana:
    description: Felles loggverkt&oslash;y for feils&oslash;king.
    examples: ''
  graphite:
    description: Monitorering av ytelse RAM/load/disk
    examples: ''
  dockerui:
    description: Grafisk h&aring;ndtering av dockercontainere
    examples: ''
  services:
    description: API for LS.ext som h&aring;ndterer dataflyt mellom RDF, Koha og presentasjonslag.
    examples:
      - /work/w1029812245
      - /publication/p2135235089
  fuseki:
    description: RDF-endpoint
    examples: ''
  elasticsearch:
    description: Indekseringsmotor
    examples: ''