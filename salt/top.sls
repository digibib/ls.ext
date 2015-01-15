base:
  '*':
    - common
    - common.docker
    - resource_monitoring.collector

  'vm-ship,vm-devops':
    - match: list

  'wombat,vm-devops':
    - match: list
    - elk
    - elk.configserver
    - elk.pulled
    - elk.dockerized
#    - elk.dockerlog-forwarder
    - resource_monitoring.server

  'wombat,vm-ship':
    - match: list
    - elk
    - elk.dockerlog-forwarder
    - mysql.pulled
    - koha.pulled
    - sip.pulled
    - koha-restful.pulled
    - mysql.dockerized
    - koha-restful.dockerized
    - koha.dockerized
    - sip.dockerized
    - migration.dockerized
