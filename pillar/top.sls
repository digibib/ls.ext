# PILLAR TOP
base:
  '^(wombat|ubuntu|detektor|\w+-ship)$':
    - match: pcre
    - koha
    - koha.admin
    - sip
    - migration
    - migration.admin
    - overview # overview
    - redef  # overview

  '^(\w+-ship)$':
    - match: pcre
    - docker.dev
    - sip.dev
    - redef
    - redef.dev
    - overview.dev
    - common.dev

  'detektor':
    - match: list
    - docker.prod
    - registry.prod
    - elk.prod1
    - sip.kohatest
    - resource_monitoring.prod1
    - overview # overview
    - overview.kohatest  # overview
    - elk.prod1  # overview
    - common.prod

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
    - common.prod

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
    - common.prod

