base:
  '*':
    - common
    - common.docker
    - common.docker-params

  '^(\w+-ship|vm-devops)$':
    - match: pcre
    - common.docker-aufs

  'wombat,ubuntu,vm-devops':
    - match: list

  'detektor':
    - match: list
    - overview

  '^(\w+-ship)':
    - match: pcre
    - elasticsearch.mappings
