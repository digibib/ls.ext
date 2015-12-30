base:
  '*':
    - common
    - common.docker
    - common.docker-params

  '^(\w+-ship)$':
    - match: pcre
    - common.docker-aufs
    - elasticsearch.mappings
