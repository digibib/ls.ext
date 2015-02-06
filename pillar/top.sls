# PILLAR TOP
base:
  'wombat,vm-ship':
    - match: list
    - koha
    - koha.admin
    - sip
    - migration
    - migration.admin

  'wombat,vm-ship,vm-devops':
    - match: list
    - elk
    - resource_monitoring

  'vm-ship,vm-devops':
    - match: list
    - elk.dev
    - sip.dev
    - resource_monitoring.dev

  'wombat':
    - match: list
    - elk.prod
    - sip.prod
    - resource_monitoring.prod
