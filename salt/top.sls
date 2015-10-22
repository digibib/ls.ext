base:
  '*':
    - common
    - common.docker
    - common.docker-params
    - dockerui
    - resource_monitoring.collector

  '^(\w+-ship|vm-devops)$':
    - match: pcre
    - common.docker-aufs

  'wombat,vm-devops':
    - match: list
    - registry # not really used in vm-devops, just installed to make sure installation works
    - overview
    - elk
    - elk.configserver
    - elk.pulled
    - elk.dockerized
#    - elk.dockerlog-forwarder
    - resource_monitoring.server

  '^(wombat|\w+-ship)$':
    - match: pcre
    - elk
    - elk.dockerlog-forwarder
    - mysql.pulled
    - koha.pulled
    - sip.pulled
    - mysql.dockerized
    - koha.dockerized
    - sip.dockerized
    - migration.dockerized

  'detektor':
    - match: list
    - elk
    - elk.dockerlog-forwarder
    - mysql.pulled
    - koha.pulled
    - sip.pulled
    - mysql.dockerized
    - koha.dockerized
    - sip.dockerized
    - migration.dockerized
    - overview

  'wombat,vm-ship':
    - match: list
    - redef.fuseki
    - redef.elasticsearch
    - redef.services.pulledrun
    - redef.catalinker.pulledrun
    - redef.patron-client.pulledrun

  'vm-ship':
    - match: list
    - redef.elasticsearch.mappings

  'build-ship':
    - match: list
    - redef.fuseki
    - redef.elasticsearch
    - redef.services.builtrun
    - redef.catalinker.builtrun
    - redef.patron-client.builtrun
    - redef.elasticsearch.mappings

  'dev-ship':
    - match: list
    - redef.fuseki
    - redef.elasticsearch
    - redef.services.builtrun
    - redef.catalinker.skeletonrun
    - redef.patron-client.builtrun
    - redef.elasticsearch.mappings    # Put last because Elasticsearch needs some time to spin up before accepting connects
