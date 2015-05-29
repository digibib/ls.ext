# PILLAR TOP
base:
  '^(wombat|\w+-ship)$':
    - match: pcre
    - koha
    - koha.admin
    - sip
    - migration
    - migration.admin

  '^(wombat|\w+-ship|vm-devops)$':
    - match: pcre
    - elk
    - resource_monitoring

  '^(\w+-ship|vm-devops)$':
    - match: pcre
    - elk.dev
    - resource_monitoring.dev

  '^(\w+-ship)$':
    - match: pcre
    - sip.dev
    - redef.dev

  'wombat':
    - match: list
    - elk.prod
    - sip.prod
    - redef.prod
    - resource_monitoring.prod
