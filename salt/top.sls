base:
  '*':
    - common

  'P@nodename:(vm-ship|wombat)':
    - match: compund
    - common.docker
    - mysql.dockerized

  'nodename:vm-ship':
    - common.nsenter

  'nodename:vm-ext':
    - match: grain
    - koha.logstash-forwarder
    - koha
    - koha.apache2
    - koha.common
    - mysql.client
    - mysql.server  # need this to run createdb (which does more than create a db)
    - koha.sites-config
    - koha.createdb
    - koha.config # includes switching to db instance on vm-ship
    - koha.webinstaller
    - koha.restful

  'nodename:vm-devops':
    - match: grain
    - kibana
