base:
  '*':
    - common

  'nodename:ls-db':
    - match: grain
    - mysql-server
    - mysql-server.networked
    - koha.create_empty_db

  'nodename:ls-ext':
    - match: grain
    - koha.logstash-forwarder
    - koha
    - koha.apache2
    - koha.common
    - mysql-server # need this to run createdb (which does more than create a db)
    - koha.sites-config
    - koha.createdb
    - koha.config # includes switching to db instance on ls.db
    - koha.webinstaller
    - koha.restful

  'nodename:ls-devops':
    - match: grain
    - kibana
