base:
  '*':
    - common
    - common.docker

  'vm-ship,vm-devops':
    - match: list

  'dfb,vm-devops':
    - match: list
    - elk
    - elk.configserver
    - elk.pulled
    - elk.dockerized
    - elk.dockerlog-forwarder

  'wombat,vm-ship':
    - match: list
    - elk
    - elk.dockerlog-forwarder
    - mysql.pulled
    - koha.pulled
    - mysql.dockerized
    - koha.dockerized
    - migration.dockerized
