base:
  '*':
    - common

  'nodename:vm-ship':
    - match: grain
    - common.docker
    - common.nsenter
    - mysql.dockerized
    - koha.dockerized

  'nodename:vm-devops':
    - match: grain
    - kibana
