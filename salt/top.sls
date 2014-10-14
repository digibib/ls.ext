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
    - elk.log_forwarder.dockerized

  'vm-devops':
    - common.docker
    - common.nsenter
    - elk.pulled
    - elk.dockerized
