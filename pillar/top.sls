# PILLAR TOP
base:
  '^(wombat|detektor|\w+-ship)$':
    - match: pcre
    - koha
    - koha.admin
    - sip
    - migration
    - migration.admin

  '^(wombat|detektor|\w+-ship|vm-devops)$':
    - match: pcre
    - dockerui
    - elk
    - resource_monitoring

  '^(\w+-ship|vm-devops)$':
    - match: pcre
    - docker.dev
    - elk.dev
    - resource_monitoring.dev

  '^(\w+-ship)$':
    - match: pcre
    - sip.dev
    - redef
    - redef.dev

  'wombat,vm-devops':
    - match: list
    - overview # overview
    - koha # overview
    - resource_monitoring # overview
    - redef  # overview

  'detektor':
    - match: list
    - docker.prod
    - registry.prod
    - elk.prod
    - sip.kohatest
    - resource_monitoring.prod
    - overview # overview
    - overview.kohatest  # overview
    - elk.prod  # overview

  'wombat':
    - match: list
    - docker.prod
    - registry.prod
    - elk.prod
    - sip.prod
    - redef.prod
    - resource_monitoring.prod
    - overview.prod  # overview
    - redef.prod  # overview
    - elk.prod  # overview

  'vm-devops':
    - match: list
    - registry.dev
    - overview.dev  # overview
    - redef.dev  # overview
    - elk.dev  # overview
