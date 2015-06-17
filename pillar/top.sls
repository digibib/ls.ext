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
    - docker.dev
    - sip.dev
    - redef
    - redef.dev

  'wombat,vm-devops':
    - match: list
    - overview # overview
    - koha # overview
    - resource_monitoring # overview
    - redef  # overview

  'wombat':
    - match: list
    - docker.prod
    - elk.prod
    - sip.prod
    - redef.prod
    - resource_monitoring.prod
    - overview.prod  # overview
    - redef.prod  # overview
    - elk.prod  # overview

  'vm-devops':
    - match: list
    - overview.dev  # overview
    - redef.dev  # overview
    - elk.dev  # overview
