base:
  '*':
    - common
    - common.docker

  'vm-ship,vm-devops':
    - match: list
    - common.nsenter

  'dfb,vm-devops':
    - match: list
    - elk
    - elk.configserver
    - elk.pulled
    - elk.dockerized

  'wombat,vm-ship':
    - match: list
    - elk
    - elk.dockerlog-forwarder
    - mysql.pulled
    - koha.pulled
    - mysql.dockerized
    - koha.dockerized
    - migration.dockerized
