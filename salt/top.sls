base:
  '*':
    - common

  'wombat,vm-ship':
    - match: list
    - common.docker
    - mysql.pulled
    - koha.pulled
    - mysql.dockerized
    - koha.dockerized
    - migration.dockerized

  'vm-ship':
    - common.nsenter

  'vm-devops':
    - common.docker
    - common.nsenter
    - elk.pulled
    - elk.dockerized
