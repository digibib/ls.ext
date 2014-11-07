# PILLAR TOP
base:
  'wombat,vm-ship':
    - match: list
    - koha
    - koha.admin
    - migration
    - migration.admin

  'wombat,dfb,vm-ship,vm-devops':
    - match: list
    - elk

  'vm-ship,vm-devops':
    - match: list
    - elk.dev

  'wombat,dfb':
    - match: list
    - elk.prod
