base:
  '*':
    - common
    - common.docker-params

  '^(\w+-ship)$':
    - match: pcre
    - elasticsearch.mappings
    - test
