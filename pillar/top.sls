# PILLAR TOP
base:
  'wombat,vm-ship':
    - match: list
    - koha
    - koha.admin
    - sip
    - migration
    - migration.admin
    - redef

  'wombat,vm-ship,vm-devops':
    - match: list
    - elk
    - resource_monitoring

  'vm-ship,vm-devops':
    - match: list
    - elk.dev
    - sip.dev
    - redef.dev
    - resource_monitoring.dev

  'wombat':
    - match: list
    - elk.prod
    - sip.prod
    - redef.prod
    - resource_monitoring.prod
