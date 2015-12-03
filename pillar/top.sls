# PILLAR TOP
base:
  '^(wombat|ubuntu|detektor|\w+-ship)$':
    - match: pcre
    - koha
    - koha.admin
    - sip
    - migration
    - migration.admin

  '^(wombat|ubuntu|detektor|\w+-ship|vm-devops)$':
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

  'wombat,ubuntu,vm-devops':
    - match: list
    - overview # overview
    - koha # overview
    - resource_monitoring # overview
    - redef  # overview

  'detektor':
    - match: list
    - docker.prod1
    - registry.prod1
    - elk.prod1
    - sip.kohatest
    - resource_monitoring.prod1
    - overview # overview
    - overview.kohatest  # overview
    - elk.prod1  # overview

  'wombat':
    - match: list
    - docker.prod
    - registry.prod
    - elk.prod1
    - sip.prod1
    - redef.prod1
    - resource_monitoring.prod1
    - overview.prod1  # overview
    - redef.prod1  # overview
    - elk.prod1  # overview

  'ubuntu':
    - match: list
    - docker.prod
    - registry.prod
    - elk.prod2
    - sip.prod2
    - redef.prod2
    - resource_monitoring.prod2
    - overview.prod2  # overview
    - redef.prod2  # overview
    - elk.prod2  # overview

  'vm-devops':
    - match: list
    - registry.dev
    - overview.dev  # overview
    - redef.dev  # overview
    - elk.dev  # overview
