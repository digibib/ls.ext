# PILLAR TOP
base:
  'wombat,vm-ship':
    - match: list
    - koha
    - koha.admin
    - migration
    - migration.admin

  'wombat,vm-ship,vm-devops':
    - match: list
    - elk

  'vm-ship,vm-devops':
    - match: list
    - elk.dev

  'wombat':
    - match: list
    - elk.prod
