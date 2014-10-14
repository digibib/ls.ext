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

  'vm-ship':
    - common.nsenter

  'vm-devops':
    - common.docker
    - kibana.pulled
    - kibana.dockerized
